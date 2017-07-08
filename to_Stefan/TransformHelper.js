/**
 * TransformHelper is licensed under a Creative Commons Attribution-ShareAlike 4.0 International license(CC BY-SA 4.0)
 * */

// Returns an array with all parent objects, arr should be an empty array
function getParents(obj, arr, num) {

	if( obj.parent != null && num != 0)
	{
		arr.push(obj.parent);
		return getParents(obj.parent, arr, num-- );
	}
	else return arr;
};

// Sets all active Meshes to Wireframe, to make visulations visible
function setMeshesToWire(obj, bol){

	if(obj.type == "Mesh")
		obj.material.wireframe = bol;

	var arr = obj.children;
	for(var i = 0; i < arr.length; i++){
		if(arr[i].position.length() == 0)
			setMeshesToWire(arr[i], bol);
	}
}

/**
 * A helper that´s visualise transformations such as Translation,  Rotation and Scaling
 *
 * @param {Object3D} myObj - The object that the helper should follow  DEFAULT = Undefined
 * @param {int} numParent - Number of parent that the helper also should show transformations for. 0 means nothing, -1 means all parents, and any positive number means that number of parents. DEFAULT = -1
 * @param {Boolean} showRot - If the helper should show rotation. false -> show, true -> show. DEFAULT = 1
 * @param {Boolean} showScale - If the helper should show scaling. false -> show, true -> show.  DEFAULT = 1
 * @param {Boolean} showTrans - If the helper should show translation. false -> show, true -> show.  DEFAULT = 1
 * @constructor
 *
 * @author Emma Nilsson Sara Olsson, Tobias Olsson, Erik Åkesson
 */
TransformHelper = function ( myObj, numParent, showRot, showScale, showTrans){

	numParent = ( numParent !== undefined ) ? numParent : -1;
	showRot = ( showRot !== undefined ) ? showRot : 1;
	showScale = ( showScale !== undefined ) ? showScale : 1;
	showTrans = ( showTrans !== undefined ) ? showTrans : 1;
	this.object = myObj;
	this.checkifwireframe = true;

	this.object.trans = new Array();
	this.object.rot = new Array();
	this.paintRot = new Array();
	this.object.scales = new Array();
	this.paintScales = new Array();

	this.parents = getParents(this.object , new Array(), numParent); // collect all parents in an array

	if(showRot){
		this.object.rot.push(new RotHelper(this.object.rotation));
		this.paintRot.push(new PaintRot(this.object ));
		for (i = 0; i < this.parents.length; i++){
			this.object.rot.push(new RotHelper(this.parents[i].rotation));
			this.paintRot.push(new PaintRot(this.parents[i]));
		}
	}
	if(showScale){
		this.object.scales.push(new ScaleHelper(this.object.scale));
		this.paintScales.push(new PaintScale(this.object));
		for (i = 0; i < this.parents.length; i++){
			this.object.scales.push(new ScaleHelper(this.parents[i].scale));
			this.paintScales.push(new PaintScale(this.parents[i]));
		}
	}
	if(showTrans){
		this.object.trans.push(new TransHelper(this.object));
		for (i = 0; i < this.parents.length; i++){
			this.object.trans.push(new TransHelper(this.parents[i]));

		}
	}

}

TransformHelper.prototype.update = ( function () {

	return function update() {

		if(this.checkifwireframe){ //Needs to be in the update to have the posistion set
			setMeshesToWire(this.object, true); //Check this.object and non translated children
			for (var i = 0; i < this.parents.length; i++){
				setMeshesToWire(this.parents[i], true); //Check all parents and non translated children
			}
			this.checkifwireframe = false;
		}

		for(var i = 0; i < this.object.rot.length; i++){
			this.object.rot[i].update();
			this.paintRot[i].update(this.object.rot[i], this.object.trans[i], this.object.rot[i+1]);
		}

		for(var i = 0; i < this.object.scales.length; i++){
			this.object.scales[i].update();
			this.paintScales[i].update(this.object.scales[i]);
		}

		for(var i = 0; i < this.object.trans.length; i++){
			this.object.trans[i].update();
		}
	}

}() );

TransformHelper.prototype.reset = ( function () {



	return function reset() {

		for (var i = 0; i < this.object.rot.length-1; i++) {
			//Ta bort scenrooten och sen inte ha -1
			this.paintRot[i].obj.parent.remove( this.paintRot[i].translateFromParent );
			this.paintRot[i].translateFromParent = undefined;
			this.paintRot[i].obj.parent.remove(this.paintRot[i].circle);
		}
		delete this.paintRot;
		delete this.object.rot;
		this.object.rot = new Array();

		for(var i = 0; i < this.object.scales.length; i++){
			for (j = 0; j < this.paintScales[i].arrows.length; j++){
				this.paintScales[i].obj.remove(this.paintScales[i].arrows[j]);
			}
		}
		delete this.paintScales;
		delete this.object.scales;
		this.object.scales = new Array();

		for(var i = 0; i < this.object.trans.length-1; i++){
			//Ta bort scenrooten och sen inte ha -1
			this.object.trans[i].obj.parent.remove(this.object.trans[i].line);
		}
		delete this.object.trans;
		this.object.trans = new Array();

		setMeshesToWire(this.object, false); //Check this.object and non translated children
		for (var i = 0; i < this.parents.length; i++){
			setMeshesToWire(this.parents[i], false); //Check all parents and non translated children
		}
	}

}() );

/**
 * The helper that keeps track of the object´s rotation.
 *
 * @param {Euler} eulerR - Object's local rotation
 * @constructor
 *
 * @author Emma Nilsson Sara Olsson, Tobias Olsson, Erik Åkesson
 */
RotHelper = function (eulerR) {

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

};

RotHelper.prototype.update = ( function () {

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
 * The drawobject for RotHelper.
 *
 * @param {Object3D} object - The Object that this drawer should act on
 * @constructor
 *
 * @author Emma Nilsson Sara Olsson, Tobias Olsson, Erik Åkesson
 */
PaintRot = function (object) {

	this.obj = object;
	this.circle = new THREE.Line( new THREE.CircleGeometry(5, 32 ),  new THREE.MeshBasicMaterial( { color: 0x93fff2 } )); // circlecolor

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
	if(this.obj.type != "Scene"){
		this.obj.parent.add(this.circle);
	}

	this.firstUpdate = true;
}

PaintRot.prototype.update = ( function () {

	return function update(rot, trans, parentRot) {

		if(parentRot != undefined && trans != undefined){ //Ugly, but works and solves a difficult problem
			if(trans.hasTrans.length() != 0 && parentRot.hasRot.length() != 0){
				//Make circle
				var geometry = new THREE.CircleGeometry(trans.position.length(), 32 );
				this.circle.geometry = geometry;
				geometry.vertices.shift(); // Remove center vertex (line to center)


				if(trans.hasTrans.x && !trans.hasTrans.y && !trans.hasTrans.z && !parentRot.hasRot.x){

					if(parentRot.hasRot.z && !parentRot.hasRot.y){
						//Do nothing
					}else if(parentRot.hasRot.y && !parentRot.hasRot.x){
						this.circle.rotation.x = Math.PI / 2;
					}
					this.obj.parent.add(this.circle);
				}else if(trans.hasTrans.y && !trans.hasTrans.x && !trans.hasTrans.z && !parentRot.hasRot.y){
					if(parentRot.hasRot.z && !parentRot.hasRot.x){
						//Do nothing
					}else if(parentRot.hasRot.x && !parentRot.hasRot.z){
						this.circle.rotation.y = Math.PI / 2;
					}
					this.obj.parent.add(this.circle);
				}else if(trans.hasTrans.z && !trans.hasTrans.x && !trans.hasTrans.y && !parentRot.hasRot.z){
					if(parentRot.hasRot.y && !parentRot.hasRot.x){
						this.circle.rotation.x = Math.PI / 2;
					}else if(parentRot.hasRot.x && !parentRot.hasRot.y){
						this.circle.rotation.y = Math.PI / 2;
					}
					this.obj.parent.add(this.circle);
				}
			}else{
				this.obj.parent.remove(this.circle);
			}
		}else{
			if(this.obj.type != "Scene"){
				this.obj.parent.remove(this.circle);
			}
		}

		this.translateFromParent.position.setFromMatrixPosition(this.obj.matrix); //Translate the everything to this.obj position


		if(rot.hasRot.z){
			this.redSphereRotNode.traverse( function ( object ) { object.visible = true; } );
			this.redSphereRotNode.rotation.z += 0.03;
			this.redCircle.traverse( function ( object ) { object.visible = true; } );
		} else {
			this.redSphereRotNode.traverse( function ( object ) { object.visible = false; } );
			this.redCircle.traverse( function ( object ) { object.visible = false; } );
		}
		if(rot.hasRot.y){
			this.blueSphereRotNode.traverse( function ( object ) { object.visible = true; } );
			this.blueSphereRotNode.rotation.y += 0.03;
			this.blueCircle.traverse( function ( object ) { object.visible = true; } );
		} else {
			this.blueSphereRotNode.traverse( function ( object ) { object.visible = false; } );
			this.blueCircle.traverse( function ( object ) { object.visible = false; } );
		}
		if(rot.hasRot.x){
			this.greenSphereRotNode.traverse( function ( object ) { object.visible = true; } );
			this.greenSphereRotNode.rotation.x += 0.03;
			this.greenCircle.traverse( function ( object ) { object.visible = true; } );
		} else {
			this.greenSphereRotNode.traverse( function ( object ) { object.visible = false; } );
			this.greenCircle.traverse( function ( object ) { object.visible = false; } );
		}
	}

}() );

/**
 * The helper that keeps track of the object´s scaling.
 *
 * @param {Vector3} scale - Object's local scale
 * @constructor
 *
 * @author Emma Nilsson Sara Olsson, Tobias Olsson, Erik Åkesson
 */
ScaleHelper = function (scale) {

	this.myscale = scale; //The scale of the object
	this.latestscale = new THREE.Vector3(this.myscale.x, this.myscale.y, this.myscale.z); //The leatest scale
	this.hasScale = new THREE.Vector3(0,0,0); //A vector that has true (1) or false(0) for each axis (x,y,z) if the object has a scale transform

	this.hasScalePositive = new THREE.Vector3(0,0,0); //A vector that has true (1) or false(0) for each axis (x,y,z) if the object has a scale transform
	this.hasScaleNegative = new THREE.Vector3(0,0,0); //A vector that has true (1) or false(0) for each axis (x,y,z) if the object has a scale transform

};

ScaleHelper.prototype.update = ( function () {

	return function update() {

		var diffscale = new THREE.Vector3;
		diffscale.subVectors(this.myscale, this.latestscale); //Takes the difference of totrot and latsetrot

		//A vector that has true (1) or false(0) for each axis (x,y,z) if the object has rootation.
		this.hasScale = new THREE.Vector3((diffscale.x > 0 || diffscale.x < 0), (diffscale.y > 0 || diffscale.y < 0), (diffscale.z > 0 || diffscale.z < 0));

		this.hasScalePositive = new THREE.Vector3(diffscale.x > 0 , diffscale.y > 0 , diffscale.z > 0 );
		this.hasScaleNegative = new THREE.Vector3(diffscale.x < 0 , diffscale.y < 0 , diffscale.z < 0 );

		//To update the current scale as the latest so we can compare it with the new next time.
		this.latestscale.x = this.myscale.x;
		this.latestscale.y = this.myscale.y;
		this.latestscale.z = this.myscale.z;

		return this;
	}

}() );

/**
 * The drawobject for ScaleHelper.
 *
 * @param {Object3D} object - The Object that this drawer should act on
 * @constructor
 *
 * @author Emma Nilsson Sara Olsson, Tobias Olsson, Erik Åkesson
 */
PaintScale = function (object) {

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

PaintScale.prototype.update = ( function () {


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

/**
 * The helper that keeps track and draw the translation of objects.
 *
 * @param {Object3D} trans - The object that we wants to check the translation of
 * @constructor
 *
 * @author Emma Nilsson Sara Olsson, Tobias Olsson, Erik Åkesson
 */
TransHelper = function (trans) {

	this.obj = trans;
	this.position = trans.position;
	geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3(0,0,0),
		this.position
	);
	material =  new THREE.LineBasicMaterial({color: 0xff00ff});
	this.line = new THREE.LineSegments(geometry, material);
	this.hasTrans = new THREE.Vector3(0,0,0);
};

TransHelper.prototype.update = ( function () {

	return function update() {

		if (this.position.length() != 0) {
			this.hasTrans = new THREE.Vector3(this.position.x != 0, this.position.y != 0, this.position.z != 0);

			geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3(0,0,0),
				this.position
			);

			//create line and add to the scene
			this.line.geometry = geometry;
			if(this.obj.type != "Scene") {
				this.obj.parent.add(this.line);
			}

		}
		return this;
	}

}() );

