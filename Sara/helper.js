THREE.PaintRot = function (object) {

	this.obj = object;

	var radius  = 0.75,
		//radius  = 1, //Should be 1 so that we can scale the circels in update. The scale is calculated by the boundingSphere of the object.
		segments = 64,
		myRed = new THREE.MeshBasicMaterial( { color: 0x0000ff } ), // red but is blue
		myGreen = new THREE.MeshBasicMaterial( { color: 0xff0000 } ), // green but is red
		myBlue = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ), // blue but is green
		//the three rotationcircles
		geometry = new THREE.CircleGeometry( radius, segments ),
		//The three rotationspheres
		geometrySphere = new THREE.SphereGeometry( 0.1, 16, 16 );
	this.redCircle = new THREE.Line( geometry,  myRed );
	this.greenCircle = new THREE.Line( geometry,  myGreen );
	this.blueCircle = new THREE.Line( geometry,  myBlue );
	this.redSphere = new THREE.Mesh( geometrySphere, myRed );
	this.greenSphere = new THREE.Mesh( geometrySphere, myGreen );
	this.blueSphere = new THREE.Mesh( geometrySphere, myBlue );

	this.circleGroup = new THREE.Group(); //An object with all circles
	this.redSphereRotNode = new THREE.Group(); //Used to rotate the spheres around center of object
	this.greenSphereRotNode = new THREE.Group();
	this.blueSphereRotNode = new THREE.Group();
	this.translateFromParent = new THREE.Group(); //A group used to translate all the draw for rotation to right object/group

	this.greenCircle.rotation.y = Math.PI / 2;
	this.blueCircle.rotation.x = Math.PI / 2;

	geometry.vertices.shift(); // Remove center vertex (line to center)

	this.circleGroup.add(this.redCircle);
	this.circleGroup.add(this.greenCircle);
	this.circleGroup.add(this.blueCircle);
	this.redSphereRotNode.add(this.redSphere);
	this.greenSphereRotNode.add(this.greenSphere);
	this.blueSphereRotNode.add(this.blueSphere);
	this.translateFromParent.add(this.circleGroup);
	this.translateFromParent.add(this.redSphereRotNode);
	this.translateFromParent.add(this.blueSphereRotNode);
	this.translateFromParent.add(this.greenSphereRotNode);

	this.redSphere.position.y = radius;
	this.blueSphere.position.x = radius;
	this.greenSphere.position.z = radius;

	//If the object dont have a parent (object == Scenrot)
	if(this.obj.parent != null){
		this.obj.parent.add( this.translateFromParent );
	}else{
		this.obj.add( this.translateFromParent );
	}
	
	this.firstUpdate = true;
}

THREE.PaintRot.prototype.update = ( function () {

	return function update(rot, istranslated/*, parentRot*/) {

		/*Används endast när man har dynamiskt stora cirklar
		if(this.firstUpdate )
		{
			var bbox = new THREE.Box3().setFromObject(this.obj); //Makes a box around this.obj and all it´s children. Then we can calculate the boundingsphere
			this.circleGroup.scale.set(bbox.getBoundingSphere().radius, bbox.getBoundingSphere().radius, bbox.getBoundingSphere().radius); //Scale the size of the circles to the size of bbox boundingsphere
			this.redSphere.position.y = bbox.getBoundingSphere().radius;
			this.blueSphere.position.x = bbox.getBoundingSphere().radius;
			this.greenSphere.position.z = bbox.getBoundingSphere().radius;

			this.firstUpdate  = false;
		}

	*/

		//Make a ring if parent=rot and object=translate (Borde egentligen göras i init men går ej då inte allt är initierat då. :( )
		// this.obj.parent.remove(this.circle);
		// if(istranslated && parentRot.hasRot.length() != 0){
		// 	this.obj.parent.remove(this.circle);
		// 	//Make circle
		// 	var geometry = new THREE.CircleGeometry( 10, 64 );
		// 	this.circle = new THREE.Line( geometry,  new THREE.MeshBasicMaterial( { color: 0xffffff } ));

		//Måste ha om den är translaterad o skit för att testa
		// if(istranslatedX && !istranslatedY && !istranslatedZ && !parentRot.hasRot.x){
		//  	if(parentRot.hasRot.z && !parentRot.hasRot.y){
		// 		//Do nothing
		// 	}else if(parentRot.hasRot.y && !parentRot.hasRot.x){
		// 		this.circle.rotation.x = Math.PI / 2;
		// 	}
		// 	this.obj.parent.add(this.circle);
		// }else if(istranslatedY && !istranslatedX && !istranslatedZ && !parentRot.hasRot.y){
		// 	if(parentRot.hasRot.z && !parentRot.hasRot.x){
		// 		//Do nothing
		// 	}else if(parentRot.hasRot.x && !parentRot.hasRot.z){
		// 		this.circle.rotation.y = Math.PI / 2;
		// 	}
		// 	this.obj.parent.add(this.circle);
		// }else if(istranslatedZ && !istranslatedX && !istranslatedY && !parentRot.hasRot.z){
		// 	if(parentRot.hasRot.y && !parentRot.hasRot.x){
		// 		this.circle.rotation.x = Math.PI / 2;
		// 	}else if(parentRot.hasRot.x && !parentRot.hasRot.y){
		// 		this.circle.rotation.y = Math.PI / 2;
		// 	}
		// 	this.obj.parent.add(this.circle);
		// }
		// }
		
		this.translateFromParent.position.setFromMatrixPosition(this.obj.matrix); //Translate the everything to this.obj position


		if(rot.hasRot.z){
			this.redSphereRotNode.traverse( function ( object ) { object.visible = true; } );
			this.redSphereRotNode.rotation.z += 0.03; //*Hårdkodat Borde använda vinkelhastighet per frame?
			this.redCircle.traverse( function ( object ) { object.visible = true; } );
		} else {
			this.redSphereRotNode.traverse( function ( object ) { object.visible = false; } );
			this.redCircle.traverse( function ( object ) { object.visible = false; } );
		}
		if(rot.hasRot.y){
			this.blueSphereRotNode.traverse( function ( object ) { object.visible = true; } );
			this.blueSphereRotNode.rotation.y += 0.03; //*Hårdkodat Borde använda vinkelhastighet per frame?
			this.blueCircle.traverse( function ( object ) { object.visible = true; } );
		} else {
			this.blueSphereRotNode.traverse( function ( object ) { object.visible = false; } );
			this.blueCircle.traverse( function ( object ) { object.visible = false; } );
		}
		if(rot.hasRot.x){
			this.greenSphereRotNode.traverse( function ( object ) { object.visible = true; } );
			this.greenSphereRotNode.rotation.x += 0.03; //*Hårdkodat Borde använda vinkelhastighet per frame?
			this.greenCircle.traverse( function ( object ) { object.visible = true; } );
		} else {
			this.greenSphereRotNode.traverse( function ( object ) { object.visible = false; } );
			this.greenCircle.traverse( function ( object ) { object.visible = false; } );
		}
	}

}() );


/**
 * @author Sara Olsson osv
 */

THREE.PaintScale = function (object) {

	this.obj = object;
	
	var arrowLength = 3;

	var negStart = 5,
		   posStart = 2;
	
	this.arrows= new Array();
	
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( -1, 0, 0 ), new THREE.Vector3( negStart, 0, 0 ), arrowLength, 0xff0000 )  ); // neg X 
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 1, 0, 0 ),  new THREE.Vector3( -negStart, 0, 0 ) , arrowLength, 0xff0000 )  ); // neg X2
	
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( posStart , 0, 0 ) , arrowLength, 0xff0000 )  ); // pos X 
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( -1, 0, 0 ), new THREE.Vector3( -posStart , 0, 0 ), arrowLength, 0xff0000 )  ); // pos X2
	
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 0, -1, 0 ), new THREE.Vector3( 0, negStart, 0 ), arrowLength, 0x00ff00 )  ); // neg Y
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, -negStart, 0 ), arrowLength, 0x00ff00 )  ); // neg Y2
	
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, posStart, 0 ), arrowLength, 0x00ff00 )  ); // pos Y
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 0, -1, 0 ), new THREE.Vector3( 0, -posStart, 0 ), arrowLength, 0x00ff00 )  ); // pos Y2
	
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 0, 0, -1 ), new THREE.Vector3( 0, 0, negStart ), arrowLength, 0x0000ff )  ); // neg Z
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, -negStart ), arrowLength, 0x0000ff )  ); // neg Z2
	
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, posStart ), arrowLength, 0x0000ff )  ); // pos Z
	this.arrows.push(  new THREE.ArrowHelper(new THREE.Vector3( 0, 0, -1 ), new THREE.Vector3( 0, 0, -posStart ), arrowLength, 0x0000ff )  ); // pos Z2


}

THREE.PaintScale.prototype.update = ( function () {


	return function update(scaleHelper) {
		
	
			for (i = 0; i < this.arrows.length; i++){
				this.obj.remove(this.arrows[i]);
			}
			
			
			if(  scaleHelper.hasScaleNegative.x )
			{
				
					this.obj.add( this.arrows[0] );
					this.obj.add( this.arrows[1] );
			}
			else if( scaleHelper.hasScalePositive.x  )  
			{
					this.obj.add( this.arrows[2] );
					this.obj.add( this.arrows[3] );
			}
			
			if(  scaleHelper.hasScaleNegative.y )
			{
					this.obj.add( this.arrows[4] );
					this.obj.add( this.arrows[5] );
			}
			else if( scaleHelper.hasScalePositive.y )  
			{
					this.obj.add( this.arrows[6] );
					this.obj.add( this.arrows[7] );
			}
			
			if(  scaleHelper.hasScaleNegative.z )
			{
					this.obj.add( this.arrows[8] );
					this.obj.add( this.arrows[9] );
			}
			else if( scaleHelper.hasScalePositive.z )  
			{
					this.obj.add( this.arrows[10] );
					this.obj.add( this.arrows[11] );
			}

	}

}() );



// returns an array with all parent objects, arr should be an empty array
function getParents(obj, arr, num) {

	if( obj.parent != null && num != 0)
	{
		arr.push(obj.parent);
		return getParents(obj.parent, arr, num-- );
	}
	else return arr;
};


// File:xxx/y/zz/TransFormHelper.js

/**
 * A helper that´s visualise transformations such as Translation,  Rotation and Scaling
 *
 * @param {Object3D} obj - The object that the helper should follow  DEFAULT = Undefined
 * @param {Int} numParent - Number of parent that the helper also should show transformations for. 0 means nothing, -1 means all parents, and any positive number means that number of parents. DEFAULT = -1
 * @param {Boolean} showRot - If the helper should show rotation. false -> show, true -> show. DEFAULT = 1
 * @param {Boolean} showScale - If the helper should show scaling. false -> show, true -> show.  DEFAULT = 1
 * @param {Boolean} showTrans - If the helper should show translation. false -> show, true -> show.  DEFAULT = 1
 * @constructor
 *
 * @author Emma Nilsson Sara Olsson, Tobias Olsson, Erik Åkesson / http:
 */

THREE.TransformHelper = function ( myObj, numparent, showRot, showScale, showTrans){

	numparent = ( numparent !== undefined ) ? numparent : -1;
	showRot = ( showRot !== undefined ) ? showRot : 1;
	showScale = ( showScale !== undefined ) ? showScale : 1;
	showTrans = ( showTrans !== undefined ) ? showTrans : 1;
	this.object = myObj;


	this.object.rot = new Array();
	this.paintRot = new Array();
	this.object.scales = new Array();
	this.paintScales = new Array();

	this.parents = getParents(this.object , new Array(), numparent); // collect all parent in an array

	if(showRot){
		this.object.rot.push(new THREE.RotHelper(this.object.rotation));
		this.paintRot.push(new THREE.PaintRot(this.object ));
		for (i = 0; i < this.parents.length; i++){
			this.object.rot.push(new THREE.RotHelper(this.parents[i].rotation));
			this.paintRot.push(new THREE.PaintRot(this.parents[i]));
		}
	}
	if(showScale){
		this.object.scales.push(new THREE.ScaleHelper(this.object.scale));
		this.paintScales.push(new THREE.PaintScale(this.object));
		for (i = 0; i < this.parents.length; i++){
			this.object.scales.push(new THREE.ScaleHelper(this.parents[i].scale)); // scale helper to all parents
			this.paintScales.push(new THREE.PaintScale(this.parents[i]));
		}
	}
	if(showTrans){

	}



	// for (i = 0; i < this.parents.length; i++){
	// 	this.object.rot.push(new THREE.RotHelper(this.parents[i].rotation));
	// 	this.paint.push(new THREE.PaintRot(this.parents[i])); //ser fult ut när alla körs
	// }
}
THREE.TransformHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.TransformHelper.prototype.constructor = THREE.TransformHelper;

THREE.TransformHelper.prototype.update = ( function () {

	return function update() {

		for(var i = 0; i < this.object.rot.length; i++){
			this.object.rot[i].update();
			this.paintRot[i].update(this.object.rot[i], 1/*, this.object.rot[i+1]*/);
			//console.log("Object " + i + " | " + this.object.rot[i].hasRot.x + ", " + this.object.rot[i].hasRot.y + ", " + this.object.rot[i].hasRot.z);
		}
		
		for(var i = 0; i < this.object.scales.length; i++){
			
			this.object.scales[i].update();
			this.paintScales[i].update(this.object.scales[i]); 
			
			//console.log("Object scales " + i + " | " + this.object.scales[i].hasScale.x + ", " + this.object.scales[i].hasScale.y + ", " + this.object.scales[i].hasScale.z);
			
		} 
	}

}() );

/**
 * @author Erik Åkesson
 */

THREE.RotHelper = function (eulerR) {

	//this.cnt = 0 //only to not spam

	//for rot
	this.eulerRot = eulerR; //The rot of the object
	this.latestrot = new THREE.Vector3(this.eulerRot.x, this.eulerRot.y, this.eulerRot.z); //The leatestrot
	this.hasRot = new THREE.Vector3(0,0,0); //A vector that has true (1) or false(0) for each axis (x,y,z) if the object has rootation.
	this.rotvelocityM = new THREE.Vector3(0,0,0); //A vector that holds the Momentan rotationvelocity in rad/s for each axis (x,y,z) of an eulerRot
	this.rotvelocityA = new THREE.Vector3(0,0,0); //A vector that holds the Average rotationvelocity in rad/s for each axis (x,y,z) of an eulerRot

	//for time
	var date = new Date();
	this.startTime = date.getTime();
	this.latesttime = date.getTime();

	//this.update();

};

THREE.RotHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.RotHelper.prototype.constructor = THREE.RotHelper;

THREE.RotHelper.prototype.update = ( function () {

	return function update() {

		var diffrot = new THREE.Vector3;
		diffrot.subVectors(this.eulerRot, this.latestrot); //Takes the difference of totrot and latsetrot

		//A vector that has true (1) or false(0) for each axis (x,y,z) if the object has rootation.
		this.hasRot = new THREE.Vector3((diffrot.x != 0), (diffrot.y != 0), (diffrot.z != 0));

		//Date and time to check the velocity and not rot
		var date = new Date();
		var difftime = date.getTime()- this.latesttime; //Time since the last update
		var elapsedTime = date.getTime() - this.startTime; ////Time since the beginning of it all

		//A vector that holds the Momentan rotationvelocity in rad/s for each axis (x,y,z) of an eulerRot
		this.rotvelocityM = diffrot.divideScalar(difftime);

		//A vector that holds the Average rotationvelocity in rad/s for each axis (x,y,z) of an eulerRot
		this.rotvelocityA = this.eulerRot.toVector3().divideScalar(elapsedTime);


		//To update the current rot as the latest so we can compare it with the new next time.
		this.latesttime = date.getTime();
		this.latestrot.x = this.eulerRot.x;
		this.latestrot.y = this.eulerRot.y;
		this.latestrot.z = this.eulerRot.z;

		return this;
	}

}() );

/**
 * @author Sara Olsson osv .. 
 */

THREE.ScaleHelper = function (scale) {

	this.myscale = scale; //The scale of the object
	this.latestscale = new THREE.Vector3(this.myscale.x, this.myscale.y, this.myscale.z); //The leatest scale
	this.hasScale = new THREE.Vector3(0,0,0); //A vector that has true (1) or false(0) for each axis (x,y,z) if the object has a scale transform
	
	this.hasScalePositive = new THREE.Vector3(0,0,0); //A vector that has true (1) or false(0) for each axis (x,y,z) if the object has a scale transform
	this.hasScaleNegative = new THREE.Vector3(0,0,0); //A vector that has true (1) or false(0) for each axis (x,y,z) if the object has a scale transform
	
	//this.update();

};

THREE.ScaleHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.ScaleHelper.prototype.constructor = THREE.ScaleHelper;

THREE.ScaleHelper.prototype.update = ( function () {

	return function update() {

		var diffscale = new THREE.Vector3;
		diffscale.subVectors(this.myscale, this.latestscale); //Takes the difference of totrot and latsetrot

		//A vector that has true (1) or false(0) for each axis (x,y,z) if the object has rootation.
		//this.hasScale = new THREE.Vector3((diffscale.x != 0), (diffscale.y != 0), (diffscale.z != 0));
	    this.hasScale = new THREE.Vector3((diffscale.x > 0 || diffscale.x < 0), (diffscale.y > 0 || diffscale.y < 0), (diffscale.z > 0 || diffscale.z < 0));
		
		this.hasScalePositive = new THREE.Vector3(diffscale.x > 0 , diffscale.y > 0 , diffscale.z > 0 );
		this.hasScaleNegative = new THREE.Vector3(diffscale.x < 0 , diffscale.y < 0 , diffscale.z < 0 );
		
		//To update the current scale as the latest so we can compare it with the new next time.
		this.latestscale.x = this.myscale.x;
		this.latestscale.y = this.myscale.y;
		this.latestscale.z = this.myscale.z;
		
	// 	console.log("this.latestscale " + i + " | " +this.latestscale.x + ", " + this.latestscale.y + ", " + this.latestscale.z );

		return this;
	}

}() );

/**
 * @author Tobias Olsson, Emma Nilsson, Sara Olsson and Erik Åkesson 
 */
 
THREE.TransHelper = function (trans, parents) {
	
	this.obj = trans;
	this.position = trans.position;
	this.parents = parents;
	this.line = new Array();
	this.latestTrans = new Array();
	this.latestLength = new Array();
	this.hasTrans = false;
	
	//this.update();
};


THREE.TransHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.TransHelper.prototype.constructor = THREE.TransHelper;

THREE.TransHelper.prototype.update = ( function () {

	return function update() {

		//checks if the object has been translated
		if (this.latestTrans.length == 0 || this.latestTrans.length != this.parents.length) {
			this.hasTrans = true;
		}
		else if (this.latestTrans.length == this.parents.length){

			//varaiables to compare
			var count = 0;
			var nya = new Array();
			var temp = new THREE.Vector3();
			
			for (var i = 0; i < this.parents.length; i++){
				if(i != 0)
				{
					temp.addVectors(this.parents[i-1].position, this.parents[i].position);
					nya[i] = this.parents[i-1].position.distanceTo(temp);

					//if the length of the vectors are equal, add to count
					if (this.latestLength[i] == nya[i]){
						count++;
					}
				}

			}

			//if all distances are not equal
			if (count != this.latestTrans.length-1){
				this.hasTrans = true;
			}
			else {
				this.hasTrans = false;
			}
		}

		//if translation has occurred
		if(this.hasTrans == true){
			
			//erase previous lines
			for(var i = 0; i < this.line.length; i++){
			 	this.parents[i].remove(this.line[i]);
			}

			//variables to compare
			var geometry = new Array();
			var temp = new THREE.Vector3();
			this.latestLength[0] = 0;
			var material =  new THREE.LineBasicMaterial({color: 0x0000ff});
			
			//go through all objects to create lines between them
			for(var i = 0; i < this.parents.length; i++){

				geometry[i] = new THREE.Geometry();
				this.latestTrans[i] = this.parents[i].position;

				//zero does not need to be checked
				if(i != 0){
					//create vertices for the line
					temp.addVectors(this.parents[i-1].position, this.parents[i].position);
					geometry[i].vertices.push(
						this.parents[i-1].position,
						temp
					);
					//calculate the length of the line
					this.latestLength[i] = this.parents[i-1].position.distanceTo(temp);
				}

				//create line and add to the scene
				this.line[i] = new THREE.LineSegments(geometry[i], material);
				this.parents[i].add(this.line[i]);
			}
			
			//reset translation
			this.hasTrans = false;
		}
		
		return this;
	}

}() );