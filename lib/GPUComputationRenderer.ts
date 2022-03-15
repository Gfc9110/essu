import {
  Camera,
  ClampToEdgeWrapping,
  DataTexture,
  FloatType,
  IUniform,
  Mesh,
  NearestFilter,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  TextureFilter,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

// @ts-ignore
import passtroughVertexShader from "../utils/shaders/gpuComputationRenderer/passtroughVertexShader.glsl?raw";

// @ts-ignore
import passtroughFragmentShader from "../utils/shaders/gpuComputationRenderer/passtroughFragmentShader.glsl?raw";

export interface ComputeVariable {
  name: string;
  initialValueTexture: DataTexture;
  material: ShaderMaterial;
  dependencies: ComputeVariable[];
  renderTargets: WebGLRenderTarget[];
  wrapS: any;
  wrapT: any;
  minFilter: TextureFilter;
  magFilter: TextureFilter;
}

export default class GPUComputationRenderer {
  public dataType = FloatType;
  private currentTextureIndex = 0;
  private readonly passThruUniforms: { [uniform: string]: IUniform<DataTexture> } = {
    passThruTexture: { value: null },
  };
  private passTrhuShader: ShaderMaterial;
  private scene: Scene = new Scene();
  private camera: Camera = new Camera();
  private variables: ComputeVariable[] = [];
  private mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  constructor(private sizeX: number, private sizeY: number, private renderer: WebGLRenderer) {
    this.camera.position.z = 1;
    this.passTrhuShader = this.createShaderMaterial(
      passtroughFragmentShader,
      this.passThruUniforms
    );
    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.passTrhuShader);
    this.scene.add(this.mesh)
  }
  addVariable(
    name: string,
    fragmentShader: string,
    initialValueTexture: DataTexture
  ): ComputeVariable {
    const variable: ComputeVariable = {
      name,
      initialValueTexture,
      material: this.createShaderMaterial(fragmentShader),
      dependencies: [],
      renderTargets: [],
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
    };
    this.variables.push(variable);
    return variable;
  }
  setVariableDependencies(variableName: string, dependenciesNames: string[]) {
    const v = this.variables.find((v) => v.name === variableName);
    if (v) {
      dependenciesNames
        .map((dn) => this.variables.find((v) => v.name === dn))
        .filter((x) => !!x)
        .forEach((v2) => v.dependencies.push(v2));
    }
  }
  init() {
    if (
      this.renderer.capabilities.isWebGL2 === false &&
      this.renderer.extensions.has("OES_texture_float") === false
    ) {
      throw "No OES_texture_float support for float textures.";
    }

    if (this.renderer.capabilities.maxVertexTextures === 0) {
      throw "No support for vertex shader textures.";
    }
    this.variables.forEach((variable) => {
      // Creates rendertargets and initialize them with input texture
      variable.renderTargets.push(
        this.createRenderTarget(
          this.sizeX,
          this.sizeY,
          variable.wrapS,
          variable.wrapT,
          variable.minFilter,
          variable.magFilter
        ),
        this.createRenderTarget(
          this.sizeX,
          this.sizeY,
          variable.wrapS,
          variable.wrapT,
          variable.minFilter,
          variable.magFilter
        )
      );
      this.renderTexture(variable.initialValueTexture, variable.renderTargets[0]);
      this.renderTexture(variable.initialValueTexture, variable.renderTargets[1]);
      // Adds dependencies uniforms to the ShaderMaterial
      const material = variable.material;
      const uniforms = material.uniforms;
      variable.dependencies.forEach((depVar) => {
        uniforms[depVar.name] = { value: null };
        material.fragmentShader =
          "\nuniform sampler2D " + depVar.name + ";\n" + material.fragmentShader;
      });
      this.currentTextureIndex = 0;
    });
  }
  compute() {
    const currentTextureIndex = this.currentTextureIndex;
    const nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;
    this.variables.forEach((variable) => {
      if (variable.dependencies.length) {
        const uniforms = variable.material.uniforms;
        variable.dependencies.forEach((depVar) => {
          uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
        });
      }
      this.doRenderTarget(variable.material, variable.renderTargets[nextTextureIndex]);
    });
    this.currentTextureIndex = nextTextureIndex;
  }
  getCurrentRenderTarget(variableName: string) {
    return this.variables.find((v) => v.name === variableName)?.renderTargets[
      this.currentTextureIndex
    ];
  }
  addResolutionDefine(material: ShaderMaterial) {
    material.defines.resolution = `vec2(${this.sizeX.toFixed(1)},${this.sizeY.toFixed(1)})`;
  }
  createTexture(): DataTexture {
    const texture = new DataTexture(
      new Float32Array(this.sizeX * this.sizeY * 4),
      this.sizeX,
      this.sizeY,
      RGBAFormat,
      FloatType
    );
    texture.needsUpdate = true;
    return texture;
  }
  createShaderMaterial(
    fragmentShader: string,
    uniforms: { [uniform: string]: IUniform } = {}
  ): ShaderMaterial {
    const material = new ShaderMaterial({
      uniforms,
      fragmentShader,
      vertexShader: passtroughVertexShader,
    });
    this.addResolutionDefine(material);
    return material;
  }
  createRenderTarget(
    textureSizeX = this.sizeX,
    textureSizeY = this.sizeY,
    wrapS = ClampToEdgeWrapping,
    wrapT = ClampToEdgeWrapping,
    minFilter = NearestFilter,
    magFilter = NearestFilter
  ) {
    return new WebGLRenderTarget(textureSizeX, textureSizeY, {
      wrapS,
      wrapT,
      minFilter,
      magFilter,
      format: RGBAFormat,
      type: this.dataType,
      depthBuffer: false,
    });
  }
  renderTexture(input: DataTexture, output: WebGLRenderTarget) {
    this.passThruUniforms.passThruTexture.value = input;
    this.doRenderTarget(this.passTrhuShader, output);
    this.passThruUniforms.passThruTexture.value = null;
  }
  doRenderTarget(material: ShaderMaterial, output: WebGLRenderTarget) {
    const currentRenderTarget = this.renderer.getRenderTarget();

    this.mesh.material = material;
    this.renderer.setRenderTarget(output);
    this.renderer.render(this.scene, this.camera);
    this.mesh.material = this.passTrhuShader;

    this.renderer.setRenderTarget(currentRenderTarget);
  }
}
