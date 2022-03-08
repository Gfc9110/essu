import { ShaderMaterial, Color } from "three";

/**
 *
 * @param {import("three").ColorRepresentation} startColor
 * @param {import("three").ColorRepresentation} endColor
 * @returns
 */
export default function (startColor, endColor, geometry) {
  return new ShaderMaterial({
    uniforms: {
      color1: {
        value: new Color(startColor),
      },
      color2: {
        value: new Color(endColor),
      },
      bboxMin: {
        value: geometry.boundingBox.min,
      },
      bboxMax: {
        value: geometry.boundingBox.max,
      },
    },
    vertexShader: `
      uniform vec3 bboxMin;
      uniform vec3 bboxMax;
    
      varying vec2 vUv;
  
      void main() {
        vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
    
      varying vec2 vUv;
      
      void main() {
        
        gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
      }
    `,
    wireframe: false,
  });
}
