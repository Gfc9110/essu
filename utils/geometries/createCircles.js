import {
    Mesh,
    RingGeometry,
    MeshStandardMaterial,
    Color,
} from "three";

export default function (count, radiusStep, initialThickness, finalThickness, startRadius, initialtColor, finalColor) {
    const circles = [];

    for(let i = 0; i < count; i++) {

        let circle;
        if(i < count/2) {
            const actualThickness = initialThickness + (finalThickness - initialThickness) * (i+1)/(count/2);
            console.log(i, actualThickness);
            circle = new Mesh (
                new RingGeometry(startRadius + radiusStep*i, startRadius + actualThickness + radiusStep*i, 48, 1),
                new MeshStandardMaterial({ color: new Color().lerpColors(new Color(initialtColor), new Color(finalColor), (i+1)/(count/2))})
            );    
            //console.log(i, (i+1)/(count/2));

        } else {
            const actualThickness = initialThickness + (finalThickness - initialThickness) * (1 - ((i+1)/2)/(count/2));
            console.log(i, actualThickness);
            //console.log(actualThickness);
            circle = new Mesh (
                new RingGeometry(startRadius + radiusStep*i, startRadius + actualThickness + radiusStep*i, 48, 1),
                new MeshStandardMaterial({ color: new Color().lerpColors(new Color(finalColor), new Color(initialtColor), ((i+1)/2)/(count/2))})
            );  
            //console.log(i, ((i+1)/2)/(count/2));
        }
        

        circles.push(circle);
    }


    return circles;
}   