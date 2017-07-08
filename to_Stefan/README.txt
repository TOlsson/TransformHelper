This plugin is made for THREE.js REVISION:'73' but should work with older and newer versions.  

To use this plugin you first have to import the js file. <script src="TransformHelper.js"></script>
The you need to make a Transformhelper object. helper = new TransformHelper(myObj, numParent, showRot, showScale, showTrans); //See params
And then you need to update the helper in render loop. helper.update();

	@param {Object3D} myObj - The object that the helper should follow  DEFAULT = Undefined
 	@param {int} numParent - Number of parent that the helper also should show transformations for. 0 means nothing, -1 means all parents, and any positive number means that number of parents. DEFAULT = -1
	@param {Boolean} showRot - If the helper should show rotation. false -> show, true -> show. DEFAULT = 1
	@param {Boolean} showScale - If the helper should show scaling. false -> show, true -> show.  DEFAULT = 1
	@param {Boolean} showTrans - If the helper should show translation. false -> show, true -> show.  DEFAULT = 1


Other functions to use:
	helper.reset();
