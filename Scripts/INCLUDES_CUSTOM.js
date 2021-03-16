/*
###################################################################################################################################
###################################################################################################################################
										Miscellaneous custom functions
###################################################################################################################################
###################################################################################################################################
*/
// Used to produce html outputs of methods and parameters of aa objects

function debugObject(object){
	var output = ''
	for (property in object){ 
		output += "<font color=red>" + property + "</font>" + ': ' + "<br><bold>" + object[property] + "</bold>" +'; ' + "<BR>"
	} 
	aa.print(output)
}

function getbalance(capId){ //Added by Alison 12/24/2020; needs testing
	var capDetailObjResult = aa.cap.getCapDetail(capId);
	var balanceDue = 0 
	if (capDetailObjResult.getSuccess())
	{
	capDetail = capDetailObjResult.getOutput();
	//var houseCount = capDetail.getHouseCount();
	//var feesInvoicedTotal = capDetail.getTotalFee();
	balanceDue = capDetail.getBalance();
	}
	return balanceDue
}

// Just like isTaskActive, but you can specify the cap
function isTaskActiveCap(wfstr){ // optional process name and capID
	var useProcess = false
	var processName = ""
	if (arguments.length >= 2) {
		if(arguments[1] != null){
			processName = arguments[1] // subprocess
			useProcess = true
		}
	}

	var taskCap = arguments[2] // cap

	var workflowResult = aa.workflow.getTaskItems(taskCap,wfstr,processName,null,null,"Y")
	if (workflowResult.getSuccess()){
		wfObj = workflowResult.getOutput()
	}
	else{
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage())
		return false
	}
	
	for (i in wfObj){
		fTask = wfObj[i]
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && (!useProcess || fTask.getProcessCode().equals(processName))){
			if (fTask.getActiveFlag().equals("Y")){
				return true
			}	
			else{
				return false
			}
		}
	}
}

// Just like scheduleInspection, but you can specify the cap
function scheduleInspectionCap(iType,DaysAhead){ // optional inspector ID & cap This function requires dateAdd function
	// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
	// DQ - Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment")
	
	var inspectorObj = null
	var inspTime = null
	var inspCap = null
	var inspComm = "Scheduled via Script"
	
	if (arguments.length >= 3){
		if (arguments[2] != null){
			var inspRes = aa.person.getUser(arguments[2])
			if (inspRes.getSuccess()){
				var inspectorObj = inspRes.getOutput()
			}
		}
	}

	if (arguments.length >= 4){
		if (arguments[3] != null){
			inspTime = arguments[3]
		}  
	}
		
	if (arguments.length >= 5){
		if (arguments[4] != null){
			inspComm = arguments[4]
		} 
	}
	
	if (arguments.length == 6){
		if(arguments[5] != null){
			inspCap = arguments[5]
		}
	}
	  
	var schedRes = aa.inspection.scheduleInspection(inspCap, inspectorObj, aa.date.parseDate(dateAdd(null,DaysAhead)), inspTime, iType, inspComm)
	
	if (schedRes.getSuccess()){
		logDebug("Successfully scheduled inspection : " + iType + " for " + dateAdd(null,DaysAhead))
	}
	else{
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage())
	}	
}

// Same as closeTask, but you can specificy the cap
function closeTaskCap(wfstr,wfstat,wfcomment,wfnote){ // optional process name and cap
		if (systemUserObj == null){
		systemUserObj = aa.people.getSysUserByID("ADMIN").getOutput()
		}

	var useProcess = false
	var processName = ""
	if (arguments.length >= 5){
		if (arguments[4] != null && arguments[4] != "" && arguments[4]!= " "){
			processName = arguments[4] // subprocess
			useProcess = true
		}
	}
		
	if (arguments.length == 6){
		if (arguments[5] != null && arguments[5] != "" && arguments[5]!= " "){
			var closeCap = arguments[5] // cap of interest
		}
	}

	var workflowResult = aa.workflow.getTaskItems(closeCap, wfstr, processName, null, null, null)
	
	if (workflowResult.getSuccess()){
		var wfObj = workflowResult.getOutput()
	}	
	else{
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage())
		return false
	}
	
	if (!wfstat){
		wfstat = "NA"
	}
	
	for (i in wfObj){
		var fTask = wfObj[i]
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())  && 
			(!useProcess || fTask.getProcessCode().equals(processName))){
			var dispositionDate = aa.date.getCurrentDate()
			var stepnumber = fTask.getStepNumber()
			var processID = fTask.getProcessID()

			if (useProcess){
				aa.workflow.handleDisposition(closeCap,stepnumber,processID,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"Y")
			}
			else{
				aa.workflow.handleDisposition(closeCap,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj ,"Y")
			}
			logMessage("Closing Workflow Task: " + wfstr + " with status " + wfstat)
			logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat)
		}			
	}
}

// Checks to see if there's a current CE condition on a parcel; checks the expiration date of all of the conditions found
function currentCECondition(){
	var activeCond = false
	var todayDate = new Date()
	parCondArray = getParcelConditions("Code Enforcement","Applied","Continuous Enforcement",null)

	for(cond in parCondArray){
		var expireDate = new Date(String(parCondArray[cond].expireDate.getYear()),String(parCondArray[cond].expireDate.getMonth()-1),
							String(parCondArray[cond].expireDate.getDayOfMonth()))
		if(expireDate > todayDate){
			activeCond = true
		}
	}
	return activeCond
}

// Returns the last active title/string from a capId
function getLastActiveTaskDesc(capId){
	var lastActiveTask
	// loadTasks is an Accela master function that returns all tasks
	var allTasks = loadTasks(capId)
	
	for (i in allTasks){
		if(allTasks[i].active.toUpperCase() == "Y"){
			lastActiveTask = String(i)
		}
	}
	return lastActiveTask
}

// Deletes all scheduled or open inspections; specifies the capID; must have capID
function inspCancelAllCap(){
	var inspCap = arguments[0]
	var isCancelled = false
	var inspResults = aa.inspection.getInspections(inspCap)
	if (inspResults.getSuccess()){
		var inspAll = inspResults.getOutput()
		var inspectionId
		var cancelResult
		for (ii in inspAll){
			if (inspAll[ii].getDocumentDescription().equals("Insp Scheduled") && inspAll[ii].getAuditStatus().equals("A")){
				inspectionId = inspAll[ii].getIdNumber()		// Inspection identifier	
				cancelResult = aa.inspection.cancelInspection(inspCap,inspectionId)
				if (cancelResult.getSuccess()){
					logMessage("Cancelling inspection: " + inspAll[ii].getInspectionType())
					isCancelled = true
				}
				else{
					logMessage("**ERROR","**ERROR: Cannot cancel inspection: "+inspAll[ii].getInspectionType()+", "+cancelResult.getErrorMessage())
				}
			}
		}
	}
	else{
		logMessage("**ERROR: getting inspections: " + inspResults.getErrorMessage())
	}
	return isCancelled
}

/** ************************************************************************************** 
	  *  checks for undefined or null or empty strings
	  */
function isEmpty(pVariable) {
	if (pVariable === undefined || pVariable == null || pVariable == "" || pVariable == " ") {
		return true
    } 
    else {
		return false
	}
}
/*
###################################################################################################################################
###################################################################################################################################
										ASA - Used for ApplicationSubmitAfter
###################################################################################################################################
###################################################################################################################################
*/
function ASA() {
	if (arguments.length > 0) {
		// Have to override the capId to whatever is supplied and change the app type to the supplied one
		capId = arguments[0]
		appTypeCap = aa.cap.getCap(capId).getOutput()
		appTypeArray = appTypeCap.getCapType().toString().split("/")
	}

	if (appMatch("Enforcement/Violations/*/*") && !appMatch("Enforcement/Violations/ACA Public User/Citizen")) {
		var wfComment = "Updated via ASA()."
		var wfCommentCE = "Updated via ASA(). Continuous Enforcement Record Created."
		var inspComment = "Scheduled via ASA()."
		// List of records that trigger an action if a parcel condition exists
		var recList = ["Enforcement/Violations/Environmental/Grass and Weeds", "Enforcement/Violations/Environmental/Litter",
			"Enforcement/Violations/Environmental/Vegetation", //"Enforcement/Violations/Environmental/Continuous Enforcement",
			"Enforcement/Violations/Environmental/Graffiti","Enforcement/Violations/Housing/Board and Secure"]
		var rightRec = false
		var parCondArray = new Array()

		for (rec in recList) {
			if (appMatch(recList[rec])) {
				rightRec = true
				break
			}
		}

		if (currentCECondition() && rightRec && arguments.length == 0) {
			// This is to see if there are any related Continuous Enforcement records associated with this parcel.
			var noCE = true
			var relCaps = getRelatedCapsByParcel("Enforcement/Violations/Environmental/Continuous Enforcement")

			if (relCaps != undefined) {
				// If a records is found for this parcel, check if this record has an active task
				for (CECap in relCaps) {
					if (isTaskActiveCap("Case Intake", null, relCaps[CECap].getCapID()) || isTaskActiveCap("Abatement", null, relCaps[CECap].getCapID())) {
						noCE = false
					}
				}
			}

			/*if (appMatch("Enforcement/Violations/Environmental/Grass and Weeds")) {
				if (noCE) {
					
				//	If there's no CE record, but there is a CE condition and someone is trying to start a grass record,
				//	this will close the grass record that they're creating and create a CE record on the same parcel
					
					var newCap = createCap("Enforcement/Violations/Environmental/Continuous Enforcement", "Continuous Enforcement")
					branchTask("Case Intake", "CE Record Exists", wfCommentCE, null)
					closeTask("Case Closed", "Closed", wfCommentCE, null)
					createCapComment(wfCommentCE, newCap)
					copyAddresses(capId, newCap)
					copyParcels(capId, newCap)
					copyOwner(capId, newCap)
					closeTaskCap("Case Intake", "Assigned", wfComment, null, null, newCap)
					scheduleInspectionCap("Abatement", 0, "PARKSCREW", null, inspComment, newCap)
				}
				else {
					branchTask("Case Intake", "CE Record Exists", "CE Record already exists on this parcel.", null)
					closeTask("Case Closed", "Closed", wfComment, null)
				}
			}*/
			else if (appMatch("Enforcement/Violations/Environmental/Continuous Enforcement")) {
				if (noCE) {
					closeTask("Case Intake", "Assigned", wfCommentCE, null)
					scheduleInspection("Abatement", 0, "PARKSCREW", null, inspComment)
				}
				else {
					branchTask("Case Intake", "CE Record Exists", "CE Record already exists on this parcel.", null)
					closeTask("Case Closed", "Closed", wfComment, null)
				}
			}
			if (currentCECondition()) {
				aa.print(currentCECondition())
				loopTask("Case Intake", "CE Property", wfComment, null)

				if (appMatch("Enforcement/Violations/Environmental/Graffiti")) {
					scheduleInspection("Abatement", 0, "PARKSCREW", null, inspComment + " Under Continuous Enforcement.")
                }
                else if (appMatch("Enforcement/Violations/Environmental/Grass and Weeds")) {
					scheduleInspection("Abatement", 0, "PARKSCREW", null, inspComment + " Under Continuous Enforcement.")
				}
				else if (appMatch("Enforcement/Violations/Housing/Board and Secure")) {
					closeTask("Follow-Up Inspection", "Secure Property", wfComment, null)
				}
				else {
					scheduleInspection("Abatement", 0, "NEATCREW", null, inspComment + " Under Continuous Enforcement.")
				}
			}
		}	
		else {  
			// This is to see if there are any related Continuous Enforcement records associated with this parcel.
			if (!appMatch("Enforcement/Violations/Environmental/Continuous Enforcement")) {
				
				//arguments.length == 0 is used to determine if ASA() is being called from standard choice or from IRSA()
				//if it's being called from IRSA(), then initial inspections should be scheduled.
				
				if (currentUserGroup == "EnforcementInspector" && arguments.length == 0) {
					closeTask("Case Intake", "Created In Field", wfComment, null)

					if (appMatch("Enforcement/Violations/Housing/Housing Repair")) {
						var inspType = "Housing Initial Inspection";
						scheduleInspection(inspType, 0, null, null, inspComment);
					    autoAssignInspection(getScheduledInspId(inspType));
					}
					else if (appMatch("Enforcement/Violations/Environmental/Snow")) {
						closeTask("Initial Inspection", "Ticket Issued", wfComment, null)
						addFee("SNOW 1", "ENF_ENVIRONMENTAL", "FINAL", 1, "Y")
						updateTask("Case Closed", "Billed", wfComment, null)
					}
					else {
						var daysToInsp
						var inspType

                        // Checking record type because some inspection day amounts are different
						if(appMatch("Enforcement/Violations/Environmental/Trash Can")){
							daysToInsp = 2
						}
						else{
							daysToInsp = 12
						}

						// Checking record type because some have different named inspections
						if (appMatch("Enforcement/Violations/Housing/Board and Secure")){
						    inspType = "Secure Follow-Up Inspection"
						}
						else {
						    inspType = "Follow-Up Inspection"
						}

						// Move to next task and schedule the proper inspection
						if (appMatch("Enforcement/Violations/Housing/Board and Secure") && getAppSpecific("Emergency")){
							closeTask("Initial Inspection", "Emergency Board-Up", wfComment, null)
							closeTask("Follow-Up Inspection", "Secure Property", wfComment, null)
							email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Emergency Board-Up Request", "An emergency board-up is requested for " + capId.getCustomID() + " at " + aa.address.getAddressByCapId(capId).getOutput()[0]+".")
							//email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Emergency Board-Up Request", "An emergency board-up is requested for " + capId.getCustomID() + " at Goose")
						}
						else if (appMatch("Enforcement/Violations/Housing/Board and Secure")){
							closeTask("Initial Inspection", "In Violation", wfComment, null)
                            scheduleInspection(inspType, daysToInsp, currentUserID, null, inspComment);
						}
						else{
							closeTask("Initial Inspection", "In Violation", wfComment, null)
                            scheduleInspection(inspType, daysToInsp, null, null, inspComment);
                            logDebug("goose")
                            var inspIdRene = getScheduledInspId(inspType)
                            logDebug(inspIdRene)
                            logDebug(capId.getID1())
                            logDebug(capId.getID2())
                            logDebug(capId.getID3())
                            var iObjRene = aa.inspection.getInspection(capId,inspIdRene).getOutput();
                            var inspTypeResultRene = aa.inspection.getInspectionType(iObjRene.getInspection().getInspectionGroup(),iObjRene.getInspectionType())
                            var inspSeqRene = inspTypeResultRene.getOutput()[0].getSequenceNumber()
                            logDebug(inspSeqRene)
							autoAssignInspection(getScheduledInspId(inspType));
						}

					}
				}
				else {
					closeTask("Case Intake", "Assigned", wfComment, null)
					var inspToSched

					if (appMatch("Enforcement/Violations/Housing/Board and Secure")) {
					    inspToSched = "Secure Initial Inspection"
					}
					else if (appMatch("Enforcement/Violations/Housing/Housing Repair")) {
					    inspToSched = "Housing Initial Inspection"
					}
					else {
					    inspToSched = "Initial Inspection"
					}

					if (arguments.length == 0) {
						if (appMatch("Enforcement/Violations/Housing/Board and Secure")){
							scheduleInspection(inspToSched, 0, currentUserID, null, inspComment)
						}
						else {
							scheduleInspection(inspToSched, 0, null, null, inspComment)
							autoAssignInspection(getScheduledInspId(inspToSched))
						}
					}
					    // Currently splitting ASA functions started by ACA complaints because the autoAssign function doesn't work;
                        // for some reason, autoAssign errors out when reassigning child records, but NOT creating new records
					else {
					    scheduleInspection(inspToSched, 0, null, null, inspComment);
					    autoAssignInspection(getScheduledInspId(inspToSched));
					}
				}
			}
			/*else {
				branchTask("Case Intake", "No CE conditions", "No CE condition on parcel. CE record has been closed.", null)
				closeTask("Case Closed", "Closed", wfComment, null)
			}*/

	}
	
	}
}
/*
###################################################################################################################################
###################################################################################################################################
										ASIUA - Used for ApplicationSpecificInfoUpdateAfter
###################################################################################################################################
###################################################################################################################################
*/
function ASIUA() {
    // moved this from WTUB because we moved the hearing TSI into ASI on the record
	//if (wfStatus == "Hearing Recommended")*/
	{
		var todayDate = new Date()
			aa.print(todayDate)
		var isoDate = getAppSpecific("Hearing Date").split("/")
			aa.print(getAppSpecific("Hearing Date"))
			aa.print(isoDate)
		var hearingDate = new Date(isoDate[2], isoDate[0] - 1, isoDate[1],
			 todayDate.getHours(), todayDate.getMinutes(), todayDate.getSeconds(), todayDate.getMilliseconds())
			aa.print(hearingDate)
		//var asiResult = aa.appSpecificInfo.editSingleAppSpecific(capId,"Hearing Case Number",getAppSpecific("Hearing Case Number"),"HEARING");	
		//aa.print(asiResult.getSuccess())

//pulled this method from the includes.accela.functions master script in editAppSpecific 
		aa.appSpecificInfo.editSingleAppSpecific(capId,"Hearing Case Number",getAppSpecific("Hearing Case Number"),"HEARING");
		aa.appSpecificInfo.editSingleAppSpecific(capId,"Hearing Date",getAppSpecific("Hearing Date"),"HEARING");
		aa.appSpecificInfo.editSingleAppSpecific(capId,"Action Requested",getAppSpecific("Action Requested"),"HEARING");
		aa.appSpecificInfo.editSingleAppSpecific(capId,"County Parcel #",getAppSpecific("County Parcel #"),"HEARING");
	}
            
			
    if (appMatch("Enforcement/Violations/ACA Public User/Citizen")) {
        var inspectionType = "Complaint Verification"
        var inspResult
        // Finding what the inspection result was because I don't want to rewrite this function; I already wrote it for IRSA
        if (checkInspectionResult(inspectionType, "Complaint Verified")) {
            inspResult = "Complaint Verified"
        }

        if (inspResult == "Complaint Verified") {
            // Variables
            var wfComment = "Updated via ASIUA()."
            var inspComment = "Scheduled via ASIUA()."
            var wfTask = getLastActiveTaskDesc(capId)
            var closeTaskName = "Complaint Outcome"
            var closeTaskStatus = ""
            var complaintEmailText = ""
            var capArray = new Array()
            var envCapTypes = ["Graffiti", "Grass and Weeds", "Litter", "Snow", "Trash Can", "Vegetation"]
            // Not used now, but might be in the future
            var hausCapTypes = ["Housing Repair"]
            var newChildCaps = new Array()

            var capItem
            var oCapId = capId
            var oCapIdString = capIDString

            // Just in case the office staff didn't update the workflow status, I check to see what task its in and make the necessary changes
            if (wfTask == "Complaint Review") {
                closeTask(wfTask, "Inspector Assigned", wfComment, null)
                closeTask("Complaint Verification", inspResult, wfComment, null)
            }
            else if (wfTask == "Complaint Verification") {
                closeTask(wfTask, inspResult, wfComment, null)
            }
            // Verified complaints get a different public status
            if (inspResult == "Complaint Verified") {
                closeTaskStatus = "Official Case Opened"
                // Always grab the ASI because that's the first data row
                capArray.push(getAppSpecific("CITATION TYPE"))

                // Grab ASIT rows, if any
                var compASITArray = loadASITable("ACA COMPLAINT DETAILS", capId)
                // Grab additonal violation types, if any
                if (compASITArray !== false && Object.keys(compASITArray).length > 0) {
                    for (compASIT in compASITArray) {
                        var row = compASITArray[compASIT]
                        var violType = row["CITATION TYPE"]
                        aa.print("Value of ASIT field = " + violType.fieldValue)
                        capArray.push(violType.fieldValue)
                    }
                }

                if (capArray.length > 0) {
                    for (var capType in capArray) {
                        capItem = capArray[capType]
                        if (!isEmpty(capItem) && String(capItem) != 'No Violation') {
                            // The majority of them will be environmental; only change if not environmental
                            var envOrHousing = "Environmental"
                            capItem = String(capItem)
                            aa.print("capItem = " + capItem)

                            // If not an environmental record, then it's a housing record...at least for now until we have more record types
                            if (envCapTypes.indexOf(capItem) == -1) {
                                envOrHousing = "Housing"
                            }
                            aa.print("envOrHousing = " + envOrHousing)
                            aa.print("oCapId = " + oCapId.getCustomID())
                            var newChildCap = createChild("Enforcement", "Violations", envOrHousing, capItem, null, oCapId)
                            aa.print("newChildCap = " + newChildCap.getCustomID())
                            // Need to add owners to new child records because createChild doesn't do this...for some reason
                            copyOwner(oCapId, newChildCap)
                            ASA(newChildCap)
                            newChildCaps.push(newChildCap.getCustomID())
                        }
                    }
                }

                aa.print("Array! " + newChildCaps)

            }

            capId = oCapId
            capIDString = oCapIdString
            closeTask(closeTaskName, closeTaskStatus, wfComment, null)
            // Check if an ASI was found, if not then send a genereic error message. Sometimes inspectors might forget to add an ASI
            if (newChildCaps.length > 0) {
                var plural
                var pluralNum
                if (newChildCaps.length == 1) {
                    plural = " case."
                    pluralNum = "number"

                }
                else {
                    plural = " cases."
                    pluralNum = "numbers"
                }
                complaintEmailText = "Thank you for contacting Code Enforcement about record " + oCapIdString + ". The neighborhood inspector visited the property and opened " + newChildCaps.length + plural + " Please visit https://aca-prod.accela.com/SOUTHBENDIN/ and search for the record " + pluralNum + " shown below if you’d like to follow the" + plural
                complaintEmailText += "<br><br>"

                for (var goose in newChildCaps) {
                    aa.print("newChildCaps[newChildCap] = " + newChildCaps[goose])
                    complaintEmailText += "<br>" + newChildCaps[goose]
                }
            }
            else {
                complaintEmailText += "Unfortunately, an error has occured and the new record number(s) are currently unavailable. Please call 311 to inquire about this error."
            }

            emailContact("Code Enforcement update for " + oCapIdString, complaintEmailText, "Resident")
        }
    }
}

/*
###################################################################################################################################
###################################################################################################################################
										CTRCA - Used for ConvertToRealCapAfter
###################################################################################################################################
###################################################################################################################################
*/
function CTRCA(){
	if (appMatch("Licenses/Registration/Landlord/Landlord Registration")){
		var asiTObjArray = new Array()
		var addrTableArray = new Array()
		var addrParcelMatch = new Array()
		var noAddrParcelMatch = new Array()
		var noParcelMatch = new Array()
		var noAddrMatch = new Array()
	  
		var emailRecordInfo = "<br><p><b>Entry Address</b>          :          Reason</p><br>"

		addrTableArray = loadASITable("LAND_REG", capId)

		if (addrTableArray.length > 0) {
			for (iAdd in addrTableArray) {
				//debugObject(addrTableArray[iAdd])
				var asiProp = addrTableArray[iAdd]
				var refAddressResultsArray = new Array()
				var asiTObj = new Object()

				var asiTNames = ["Property Street #", "Property Direction", "Property Street Name", "Property Street Type", "City", "State", "Zip Code", "Unit Name"]

				asiTObj.capId = capId
				asiTObj.recordID = capId.getCustomID()
				// MAYBE WRITE LOGIC TO SENSE IF THE PARCEL NUMBER WAS SUBMITTED WITHOUT DASHES AND THEN ADD THE DASHES???
				// IDEALLY THIS WOULD BE IN THE BEFORE CLICK ON THE ACA PAGE SUBMIT, BUT WE HAVE TO CHECK THAT ALL THE ADDRESS DATA IS
				// MAINTANED IF THERE'S A BEFORE ERROR; PEOPLE WILL GET FURIOUS IF ALL THE DATA IS LOST BECAUSE ONE PARCEL NUMBER WAS WRONG
				asiTObj.parcelNumber = asiProp["State Parcel #:"].toString().trim()
				asiTObj.houseNumStart = parseInt(asiProp["Property Street #"].toString().trim())
				asiTObj.streetDirection = asiProp["Property Direction"].toString().trim()
				asiTObj.streetName = asiProp["Property Street Name"].toString().trim()
				asiTObj.streetType = asiProp["Property Street Type"].toString().trim()
				// Unit Start is usually the field with the number and unit type is populated with just 'Unit'
				asiTObj.unitName = asiProp["Unit Name"].toString().trim()
				asiTObj.city = "South Bend"
				asiTObj.state = "IN"
				asiTObj.zip = asiProp["Zip Code"].toString().trim()
				asiTObj.addrMatch = false
				asiTObj.addrMatchReason = ""
				asiTObj.parcelMatch = false
				asiTObj.parcelMatchReason = ""
				asiTObj.refAddrObj = null
				asiTObj.refParcelObj = null
				asiTObj.fullAddress = asiTObj.houseNumStart + " " + asiTObj.streetDirection + " " + asiTObj.streetName +
					" " + asiTObj.streetType + " " + asiTObj.city + " " + asiTObj.state + " " + asiTObj.zip
				asiTObj = refAddressMatch(asiTObj)
				asiTObj = refParcelMatch(asiTObj)
				asiTObjArray.push(asiTObj)

				if (!asiTObj.addrMatch && !asiTObj.parcelMatch) {
					noAddrParcelMatch.push(asiTObj)
					emailRecordInfo = emailRecordInfo + "<br><p><b>" + asiTObj.fullAddress + "</b> : No address and no parcel match.</p>"
				}
				else if (!asiTObj.addrMatch && asiTObj.parcelMatch) {
					noAddrMatch.push(asiTObj)
					emailRecordInfo = emailRecordInfo + "<br><p><b>" + asiTObj.fullAddress + "</b> : " + asiTObj.addrMatchReason + "</p>"
					// MAYBE MAKE LOGIC TO SEE WHAT PARTS OF THE INPUT ADDRESS AND WHAT PARTS OF THE AA ADDRESS DIDN'T MATCH; MIGHT BE
					// USEFUL TO FIND ADDRESSES WITH ERRORS IN THE CITY OR COUNTY GIS ADDRESSPOINTS
				}
				else if (asiTObj.addrMatch && !asiTObj.parcelMatch) {
					noParcelMatch.push(asiTObj)
					emailRecordInfo = emailRecordInfo + "<br><p><b>" + asiTObj.fullAddress + "</b> : " + asiTObj.parcelMatchReason + "</p>"
				}
				else {
					addrParcelMatch.push(asiTObj)
					addRefAddressToCapID(asiTObj)
					addRefParcelAndOwnerToCapID(asiTObj)
					//aa.print("Getting ref object")
					//debugObject(asiTObj.refAddrObj)
					aa.print("Owner info before")
					var owCheck = aa.owner.getOwnerByCapId(capId).getOutput()
					for (thingy in owCheck) {
						// Cap owner script models
						// debugObject(owCheck[thingy])
						aa.print("\tOwner full name: " + owCheck[thingy].getOwnerFullName())
					}
					/*
					Can't use addParcelAndOwnerFromRefAddress() because it SAYS it copies from refAddress, but the
					owners actually use the parcel...the parcel is the only thing that really uses the refAddress...
					the owners just then reference the parcels; NOT GOOD!!
					*/
				}
			}
		}

		// Not needed for production, but very useful when testing
		/*
		aa.print("\n\n" + asiTObjArray.length + " total records.")
		aa.print("\n\n" + addrParcelMatch.length + " records had an address and a parcel match.")
		aa.print("\n\n" + noAddrParcelMatch.length + " records had no address and no parcel match.")
		aa.print("\n\n" + noAddrMatch.length + " records had no address match, but a parcel match.")
		aa.print("\n\n" + noParcelMatch.length + " records had no parcel match, but an address match.")

		for (item in asiTObjArray) {
			aa.print("Record: " + asiTObjArray[item].recordID)
			aa.print("\taddrMatch: " + asiTObjArray[item].addrMatch)
			aa.print("\t\taddrMatchReason: " + asiTObjArray[item].addrMatchReason)
			aa.print("\trefAddrObj " + asiTObjArray[item].refAddrObj)
			//debugObject(asiTObjArray[item].refAddrObj)
			aa.print("\tparcelMatch: " + asiTObjArray[item].parcelMatch)
			aa.print("\t\tparcelMatchReason: " + asiTObjArray[item].parcelMatchReason)
			aa.print("\trefParcelObj: " + asiTObjArray[item].refParcelObj)
		}
		*/
		var numIncorrect = asiTObjArray.length - addrParcelMatch.length

		if (numIncorrect != 0) {
			email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Problems matching address(es) and/or parcel(s) with " +
				capId.getCustomID(), numIncorrect + " entries of the " + asiTObjArray.length + " submitted had matching errors. Please see the breakdown below for more detail."
				+ emailRecordInfo)
		}
	}
	else if (appMatch("Enforcement/Violations/ACA Public User/Citizen")) {
		var emailText = "Thanks for submitting Code Enforcement record " + capIDString + "! Your neighborhood inspector will assess the property and you will receive an email update with the outcome of this case."
		emailContact("Thanks for submitting Code Enforcement record " + capIDString, emailText, "Resident")
	}

	/*
	###################################################################################################################################
		Functions specific to landlord registration
	###################################################################################################################################
	*/
	function refAddressMatch(asiTObj) {
		// May need to do single line address
		var refAddressResultsArray = refAddressSearch(asiTObj.houseNumStart, asiTObj.streetDirection, asiTObj.streetName, asiTObj.streetType, asiTObj.city, asiTObj.state, asiTObj.zip)

		aa.print("No result print: " + refAddressResultsArray)
		// Since we are already assuming that there isn't a match we only check to see if there is to change object parameters
		if (!isEmpty(refAddressResultsArray)) {
			aa.print("\tOutcome: " + refAddressResultsArray)

			if (refAddressResultsArray.length == 1) {
				// We probably have a good match, use the first address in the array to update AddressID and 
				asiTObj.addrMatch = true
				asiTObj.refAddrObj = refAddressResultsArray[0]
				asiTObj.addrMatchReason = "Address matched."
				//addRefAddressToCapID(asiTObj)
				//debugObject(refAddressResult)
			}
			else if (refAddressResultsArray.length > 1) {
				// Check if the unit matches...not a high probability
				if (1 === 0) {
					asiTObj.addrMatch = true
					asiTObj.refAddrObj = refAddressResultsArray[0]
					asiTObj.addrMatchReason = "Address matched."
					//addRefAddressToCapID(asiTObj)
				}
				else {
					asiTObj.addrMatchReason = "More than one result - couldn't match 100%"
				}
			}
		}
		// If the returned array from refAddressSearch is empty, then there weren't any results
		else {
			asiTObj.addrMatchReason = "No address match returned."
		}

		return asiTObj
	}

	function refParcelMatch(asiTObj) {
		var primaryParcelResult
		var refParcelResult

		// Used to tell if the reference address object is being used
		if (isEmpty(asiTObj.refAddrObj)) {
			aa.print("Testing parcel number: " + asiTObj.parcelNumber)
			// Returns an object. This object could be empty if there is no parcel number or populated if there was a parcel number match
			primaryParcelResult = aa.parcel.getParceListForAdmin(asiTObj.parcelNumber, null, null, null, null, null, null, null, null, null)
			//primaryParcelResult = aa.parcel.getParceListForAdmin("71-08-02-427-030.000-026", null, null, null, null, null, null, null, null, null)
		}
		else {
			aa.print("\tUsing the refAddr")
			// NEED TO CHECK TO SEE IF THERE ARE BLANK OBJECTS RETURNED; NEED TO FIND AN ADDRESS THAT DOESN'T HAVE A PARCEL TO TEST THIS
			primaryParcelResult = aa.parcel.getPrimaryParcelByRefAddressID(asiTObj.refAddrObj.getRefAddressId(), "Y")
		}

		if (primaryParcelResult.getSuccess()) {
			// If the asiTObj is being used, some extra process has to happen to get the same resulting object, ParcelModel
			if (isEmpty(asiTObj.refAddrObj)) {
				var refParcelResultsObj = primaryParcelResult.getOutput()
				aa.print("Printing debug type: " + typeof (refParcelResultsObj) + " isEmpty: " + isEmpty(refParcelResultsObj))
				debugObject(refParcelResultsObj)

				// HOW AM I GOING TO DEAL WITH MANY?
				// Add logic for multiple parcel results
				// Since we are already assuming that there isn't a match we only check to see if there is to change object parameter
				// Need to check if the array is populated or empty...even if it was successful
				aa.print("Object.keys length: " + Object.keys(refParcelResultsObj).length)
				// Removed this from the if statement below; can use typeof, but constructor isn't the right type
				// && refParcelResultsObj.constructor === Object
				if (Object.keys(refParcelResultsObj).length !== 0) {
					aa.print("I have stuff! I'm not an empty object!")
					refParcelResult = refParcelResultsObj[0].getParcelModel()
				}
				else {
					// DON'T REALLY NEED THIS. JUST USING IT TO DEBUG IF MY EMPTY OBJECT LOGIC IS CORRECT
					aa.print("Meer meer. I'm an empty object.")
				}
			}
			// ARE THERE EMPTY OBJECTS IN HERE?!?!!
			else {
				// **********************************************************************
				// what about addresses that don't have parcels??? Will they return a success but not have any information?
				// **********************************************************************
				refParcelResult = primaryParcelResult.getOutput()
			}
			//logDebug("Checked Parcel " + parcel + " was found in Reference.")

			//aa.print("refParcelResult: ")
			// If the refParcelResult is empty that means that we didn't get any object returned, which means there's defintely not a match
			if (!isEmpty(refParcelResult)) {
				// Explicitly setting to JavaScript string because the parcel number string that's returned from Accela is java.lang.string
				var aaParcelNumber = String(refParcelResult.getParcelNumber()).trim()
				// Removing the dashes and dot in our parcel number/key string
				//aaParcelNumber = aaParcelNumber.replace(/-|\./g, "")
				//parcelNumber = parcelNumber.toString().trim().replace(/-/gi,"").replace(/./gi,"")
				aa.print("\n\tAA parcel number: " + aaParcelNumber)
				aa.print("\tEntry parcel number: " + asiTObj.parcelNumber)

				// Check to see if the parcel number grabbed is the same as the one input
				// **********************************************************************************
				// A successful address object match and a successful parcel object match from the aforementioned reference address doesn't
				// mean that the parcel of that's being returned is the same parcel as the one that the user input
				if (aaParcelNumber == asiTObj.parcelNumber) {
					//addrefParcel(refParcelResult)
					asiTObj.parcelMatch = true
					asiTObj.refParcelObj = refParcelResult
					asiTObj.parcelMatchReason = "Parcel matched."
					//addRefParcelAndOwnerToCapID(asiTObj)
					aa.print("\tParcel match")
					aa.print("\t\tASIT parcel #: " + asiTObj.parcelNumber)
					aa.print("\t\tAA parcel #: " + String(asiTObj.refParcelObj.getParcelNumber()).trim().replace(/-|\./g, ""))
				}
				else {
					asiTObj.parcelMatchReason = "No parcel match returned."
				}
			}
			else {
				asiTObj.parcelMatchReason = "No parcel match returned."
			}
		}
		else {
			aa.print("aa.parcel.getParceListForAdmin(asiTObj.parcelNumber, null, null, null, null, null, null, null, null, null) or" +
				" aa.parcel.getPrimaryParcelByRefAddressID(asiTObj.refAddrObj.getRefAddressId(), \"Y\") didn't succeed.")
		}

		return asiTObj
	}

	function addRefAddressToCapID(asiTObj) {
		var refAddrModel = asiTObj.refAddrObj.toAddressModel()
		refAddrModel.setCapID(asiTObj.capId)
		refAddrModel.setPrimaryFlag("N")
		aa.address.createAddressWithAPOAttribute(asiTObj.capId, refAddrModel)
		aa.print("I did it?")
		//debugObject(aa.address.getAddressByCapId(asiTObj.capId).getOutput())
	}

	function addRefParcelAndOwnerToCapID(asiTObj) {
		var capParModel = aa.parcel.warpCapIdParcelModel2CapParcelModel(asiTObj.capId, asiTObj.refParcelObj).getOutput()
		aa.parcel.createCapParcel(capParModel)
		var parcelsOnCap = aa.parcel.getParcelDailyByCapID(asiTObj.capId, null).getOutput()
		aa.print("I did it with parcel? ")
		for (item in parcelsOnCap) {
			aa.print("\tparcelsOnCap: " + parcelsOnCap[item].getParcelNumber())
			if (parcelsOnCap[item].getParcelNumber() == asiTObj.parcelNumber) {
				aa.print("Trying to add owners")
				var parcelOwnersResult = aa.owner.getOwnersByParcel(parcelsOnCap[item])
				var ownerArr = parcelOwnersResult.getOutput()
				for (owner in ownerArr) {
					ownerArr[owner].setCapID(asiTObj.capId)
					aa.owner.createCapOwnerWithAPOAttribute(ownerArr[owner])
				}
			}
		}

		var owCheck = aa.owner.getOwnerByCapId(capId).getOutput()
		for (thingy in owCheck) {
			// Cap owner script models
			// debugObject(owCheck[thingy])
			aa.print(owCheck[thingy].getOwnerFullName())
		}
	}

	// addParcelAndOwnerFromRefAddress(refAddrID,capId)

	//function refAddressSearch(houseNumStart, streetName, city, state, zip) {
	function refAddressSearch(houseNumStart, streetDirection, streetName, streetType, city, state, zip) {
		/*---------------------------------------------------------------------------------------------------------/
		| Function Intent: 
		|	This function is designed to search the reference Address Library for addresses and return an array 
		|	of matching addresses if any are found. The required paramaters are able to be changed based on the
		|	needs of the agency.
		|
		| Returns:
		|	Outcome					
		|	Success:	array of RefAddressModels
		|	Failure:	null				
		|
		| Call Example:
		|	refAddressSearch("16","Main St", "Bridgeview", "CA", "12345");	
		|
		| 01/05/2015 - Jason Plaisted based on code provided by Dane Q.
		|	Version 1 Created
		|
		| Required paramaters in order:
		|	houseNumStart
		|	streetName
		|
		| Optional paramaters:
		|	city
		|	state
		|	zip		
		/----------------------------------------------------------------------------------------------------------*/

		var refAddArray = null
		var refAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.RefAddressModel").getOutput()

		//May require APO Attributes for search be based on config. If so the following line would be enabled
		//var attr = aa.proxyInvoker.newInstance("com.accela.aa.aamain.apotemplate.L3APOAttributeModel").getOutput();

	    //Search parameters - enable any that apply for specific agency address data
	    try {
	        refAdd.setHouseNumberStart(parseInt(houseNumStart))
	    }
	    catch (err) {
	        refAdd.setHouseNumberStart(null)
	    }
		
		//refAdd.setHouseNumberEnd();
		refAdd.setStreetDirection(streetDirection)
		refAdd.setStreetName(streetName)
		refAdd.setStreetSuffix(streetType)
		//if !isEmpty(unitStart) refAdd.setUnitStart(unitStart);
		if (!isEmpty(city)) refAdd.setCity(city)
		if (!isEmpty(state)) refAdd.setState(state)
		if (!isEmpty(zip)) refAdd.setZip(zip)
		aa.print(refAdd.getHouseNumberStart() + " " + refAdd.getStreetDirection() + " " + refAdd.getStreetName() +
			" " + refAdd.getStreetSuffix() + " " + refAdd.getCity() + " " + refAdd.getState() + " " + refAdd.getZip())


		//get Results
		refAddObj = aa.address.getRefAddressByServiceProviderRefAddressModel(refAdd)
		if (refAddObj.getSuccess()) {
			refAddArray = refAddObj.getOutput()
		}
		else {
			aa.print("aa.address.getRefAddressByServiceProviderRefAddressModel(refAdd) call didn't succeed.")
		}
		//logDebug("RefAdd " + refAdd); 
		//objectExplore(refAdd[0]);

		// Example of get ref address model by the ext_uid (XAPO ID) or address#
		// var addr = aa.address.getRefAddressByPK("6528").getOutput();
		if (!isEmpty(refAddArray)) {
			logDebug("Reference Address Array Length: " + refAddArray.length)
		}
		return refAddArray
	}
}

/*
###################################################################################################################################
###################################################################################################################################
										IRSA - Used for InspectionResultSubmitAfter
###################################################################################################################################
###################################################################################################################################
*/
function IRSA() {
	
	// Task check to see if the office staff moved the workflow to the proper stage
	// if not, this will take care of that
		aa.print("inspResult = " + inspResult)
		aa.print("inspType = " + inspType)
		aa.print("Task in follow up insp = "+ isTaskActive("Follow-Up Inspection"))

	if(appMatch("Enforcement/Violations/*/*")) {
		// Shoudn't need this, but it is a check to see that cases created in the office are in the proper stage.
		if(isTaskActive("Case Intake")) {
			closeTask("Case Intake","Assigned","Updated via IRSA()",null)
		}
		// Inspection type branching. Workflow task branching is taken care of in the sub functions
		// Need to make sure workflow branching is in the function
		if(isTaskActive("Initial Inspection")){
			if(inspType == "Initial Inspection"){
				initialInsp()
			}
			else if(inspType == "Housing Initial Inspection"){
				housingInitialInsp()
			}
			else if(inspType == "Secure Initial Inspection"){
				secureInitialInsp()
			}
		}
		else if(isTaskActive("Follow-Up Inspection")){
			aa.print("checking FU insp task active")
			if(inspType == "Follow-Up Inspection"){
				aa.print("inspType =" + inspType)
				followupInsp()
			}
			else if(inspType == "Housing Follow-Up Inspection") {
				aa.print("inspType =" + inspType)
				housingFollowUpInsp()
			}
			else if(inspType == "Housing Emergency Inspection") {
				aa.print("inspType =" + inspType)
				housingEmergencyInsp()
			}
			else if(inspType == "Secure Follow-Up Inspection"){
				aa.print("inspType =" + inspType)
				secureFollowupInsp()
			}
			else if(inspType == "Post Yard Sign" ){
				aa.print("Yay.")
				aa.print('Made it to else if statement for yard signs')
				yardSignInsp()
			}
			else if(inspType == "Monthly Inspection"){
				monthlyInsp()//email("amynsber@southbendin.gov","noreply@accela.com","within Monthly Inspection function","test")
			}
		}
		else if(inspType == "Repair Agreement Inspection" && isTaskActive("Repair Agreement")){
			repairAgreementInsp()
		}
		else if(inspType == "Secure Verification Inspection" && isTaskActive("Verification Inspection")){
			secureInsp()
		} 
		else if(inspType == "Housing Follow-Up Inspection" && isTaskActive("Post-Hearing Inspection")){
			housingFollowUpInsp()
		}
		/*
		Doesn't have a workflow check because all abatements and post-hearing abatements should get billed the exact same way.
		So, having them go to the same function is best practice. Also, continuous enforcement billing is in here and I currently
		don't have enough time to think about the CE process in-depth to break them apart.
		The workflow check between abatement and post-hearing abatement is handled in the abatementInsp() function
		*/
		else if(inspType == "Abatement" || inspType == "Post-Hearing Abatement"){
			abatementPostAbatementInsp()
		}
		// No task check because this inspection doesn't affect the workflow in any way
		else if(inspType == "Pre-Hearing Inspection"){
			preHearingInsp()
		}
		else if(inspType == "Hearing Deadline Inspection" && (isTaskActive("Hearing") || isTaskActive("Post-Hearing Inspection"))){
			hearingDeadlineInsp()
		}
		// The workflow checks are handled in the monthlyInsp() function
		else if(inspType == "Monthly Inspection"){
			monthlyInsp()
		}
		else if(inspType == "Topsoil Inspection" && isTaskActive("Post-Demo Inspection")){
			topSoilInsp()
        }
		else if (inspType == "Complaint Verification"){
			complaintInsp()
		}
	/*Lucy created the next three insp as new types September 2018, live October 2018*/	    
		if (inspType == "Vacate Follow-Up Inspection"){
		   aa.print("Vacate Follow-Up - made it")
		   housingFollowUpInsp()
		}
		if (inspType == "Ticket Follow-Up Inspection"){
		   aa.print("ticketFollowUpInspHSG - made it!")
		   housingFollowUpInsp()
        }
        if (inspType == "ENV Ticket Follow-Up Inspection"){
            aa.print("ticketFollowUpInspENV - made it!")
            followupInsp()
         }
		if (inspType == "Post Vacate Order"){
			aa.print("postVacateOrderInsp - Made it!")
			postVacateOrderInsp()
		}
	}
}
/*
###################################################################################################################################
 This is for initial inspections.
###################################################################################################################################
*/
 function initialInsp(){
	var wfComment = "Updated via IRSA() initialInsp()."
	var inspComment = "Scheduled via IRSA initialInsp()."
	var feeComment = "Fee assessed and invoiced via IRSA initialInsp()"
	var wfTask = getLastActiveTaskDesc(capId)

	if (inspResult == "In Violation") {
		closeTask(wfTask, inspResult, wfComment, null)

		if (currentCECondition()) {
			closeTask("Follow-Up Inspection", "CE Property", wfComment + " Under Continuous Enforcement.", null)

			if (appMatch("Enforcement/Violations/Environmental/Graffiti")) {
				scheduleInspection("Abatement",0,"PARKSCREW",null,inspComment + " Under Continuous Enforcement.")
			}
			else if (appMatch("Enforcement/Violations/Environmental/Litter") || appMatch("Enforcement/Violations/Environmental/Vegetation")) {
				scheduleInspection("Abatement", 0, "NEATCREW", null, inspComment  + " Under Continuous Enforcement.")
			}
		}
		else {
			var daysToInsp

			if (appMatch("Enforcement/Violations/Environmental/Trash Can")) {
				daysToInsp = 2
			}
			else {
				daysToInsp = 12
			}
			scheduleInspection("Follow-Up Inspection", daysToInsp, currentUserID, null, inspComment)
		}
	}
	else if(inspResult == "No Violation"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Closed",wfComment,null)
	}
	//Any way to make this check first if balance > 0??  And to just go straight to Closed if there isn't a balance?					   
    else if(inspResult == "Duplicate" || inspResult == "Opened In Error"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Opened In Error",wfComment,null)
    }
	  
    else if(inspResult == "Utility Check"){
		updateTask(wfTask,inspResult,wfComment,null)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Utility Check Requested for "+ 
						capIDString +" by " + currentUserID, "Please confirm utilities are on for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " and update the record accordingly.")
	}
	else if(inspResult == "Ticket Issued"){
		var feeItemCode
		feeItemCode = "SNOW 1"
		//NC pause!! addFeeWithExtraData(feeItemCode,"ENF_ENVIRONMENTAL","FINAL",1,"Y",capId,feeComment,null,null)
		closeTask(wfTask,inspResult,wfComment,null)
		updateTask("Case Closed","Billed",wfComment,null)
	}
}
/*
###################################################################################################################################
 This is for housing initial inspections.Lucy edited in September 2018, live October 2018
###################################################################################################################################
*/
function housingInitialInsp(){
	var wfComment = "Updated via IRSA() housingInitialInsp()."
	var inspComment = "Scheduled via IRSA housingInitialInsp()."
	var wfTask = getLastActiveTaskDesc(capId)

	if(inspResult == "In Violation"){
		aa.print("moving to guideSheetHousingCheck")
		var guideResult = guideSheetHousingCheck(wfComment,inspComment)
		wfComment = guideResult[0]
		/*leaving this out because vacate requests have a different status 
 		closeTask(wfTask,inspResult,wfComment,null), added workflow udpates in guidesheet function*/
	}
	else if(inspResult == "No Violation"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Closed",wfComment,null)
    }
    else if(inspResult == "Duplicate" || inspResult == "Opened In Error"){
		//Again, any way to check BALANCE to deal with this?															   
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Opened In Error",wfComment,null)
    }
	  
    else if(inspResult == "Utility Check"){
		updateTask(wfTask,inspResult,wfComment,null)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Utility Check Requested for "+ 
						capIDString +" by " + currentUserID, "Please confirm utilities are on for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " and update the record accordingly.")
	}
}

/*
###################################################################################################################################
 This is for secure initial inspections.
###################################################################################################################################
*/
function secureInitialInsp(){
	var wfComment = "Updated via IRSA() secureInitialInsp()."
	var inspComment = "Scheduled via IRSA secureInitialInsp()."
	var feeComment = "Fee assessed and invoiced via IRSA secureInitialInsp()"

	var wfTask = getLastActiveTaskDesc(capId)
	
	if(inspResult == "In Violation"){
		closeTask(wfTask,inspResult,wfComment,null)
		scheduleInspection("Secure Follow-Up Inspection",12,currentUserID,null,inspComment)
	}
	else if(inspResult == "Re-Secure Property"){
		loopTask(wfTask, inspResult, wfComment, null)
		updateTask("Secure Property", "Contractor to be Notified", wfComment, null)
	}
	else if(inspResult == "No Violation"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Closed",wfComment,null)
    }
	//Again, any way to check BALANCE to deal with this?					   
	else if(inspResult == "Duplicate" || inspResult == "Opened In Error"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Opened In Error",wfComment,null)
    }	
	  
	else if(inspResult == "Utility Check"){
		updateTask(wfTask,inspResult,wfComment,null)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Utility Check Requested for "+ 
						capIDString +" by " + currentUserID, "Please confirm utilities are on for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " and update the record accordingly.")
	}
}				
/*
###################################################################################################################################
 This is for follow-up inspections
###################################################################################################################################
*/
function followupInsp(){
	var wfComment = "Updated via IRSA() followupInsp()."
	var inspComment = "Scheduled via IRSA followupInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	var feeComment = "Fee assessed and invoiced via IRSA followupInsp()"
	var balance  = getbalance(capId) //added 12/24
	
	if(inspResult == "Hearing Recommended"){
		closeTask(wfTask,inspResult,wfComment,null)
		assignCap("BCHLEBOW")
		closeTask("Abatement",inspResult,wfComment,null)
	}
	else if(inspResult == "Duplicate" || inspResult == "Opened In Error"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		if (balance>0) { //added 12/24
			updateTask("Case Closed","Opened In Error - Review Void",wfComment,null)
		}
		else {
			closeTask("Case Closed","Opened In Error",wfComment,null)
		}	
    //Again, any way to check BALANCE to deal with this?
	}					   
    else if(inspResult == "Completed By Owner"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		if (balance>0) { //added 12/24
			updateTask("Case Closed","Review Case for Collections",wfComment,null)
		}
		else {
			closeTask("Case Closed","Closed",wfComment,null)
		}	
    }
	//Again, any way to check BALANCE to deal with this?  
	else if(inspResult == "Utility Check"){
		updateTask(wfTask,inspResult,wfComment,null)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Utility Check Requested for "+ 
						capIDString +" by " + currentUserID, "Please confirm utilities are on for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " and update the record accordingly.")
	}
	else if(inspResult == "Extension Granted"  || inspResult == "Grant Extension"){
		updateTask(wfTask,inspResult,wfComment,null)
		scheduleInspection("Follow-Up Inspection", 13, currentUserID, null, inspComment)
		//scheduleInspection("Extension Inspection",13,currentUserID,null,inspComment) AM edited April 2020 b/c extension inspections kill cases
	}
	else if(inspResult == "Send to Crew" || inspResult == "Graffiti Waiver Signed"){
		closeTask(wfTask,inspResult,wfComment,null)
		
		if(appMatch("Enforcement/Violations/Environmental/Litter") || appMatch("Enforcement/Violations/Environmental/Vegetation")){
			scheduleInspection("Abatement",1,"NEATCREW",null,inspComment)
			assignCap("NEATCREW")
		}
		else if(appMatch("Enforcement/Violations/Environmental/Graffiti")||appMatch("Enforcement/Violations/Environmental/Grass and Weeds")){
			scheduleInspection("Abatement",1,"PARKSCREW",null,inspComment)
			assignCap("PARKSCREW")
		}
	}
	else if(inspResult == "Ticket Issued"){
        if(appMatch("Enforcement/Violations/Environmental/Trash Can")){
		//NC pause!! addFeeWithExtraData("TRASH 10", "ENF_ENVIRONMENTAL", "FINAL", 1, "Y", capId, feeComment, null, null)
		updateTask("Case Closed", "Billed", wfComment, null)
        }
        else if (inspType=="ENV Ticket Follow-Up Inspection"){
                updateTask(wfTask, inspResult, wfComment, null)
                ticketFollowUpInspENV()
        }
        else {
            addFee("16-53", "ENF_ENVIRONMENTAL", "FINAL", 50, "Y")//changed to $50 from $100 9-25-2020
            scheduleInspection("ENV Ticket Follow-Up Inspection",7,currentUserID,null,inspComment)//changed to 7 from 5 9-25-2020
            updateTask(wfTask, inspResult, wfComment, null) 
            }
	}
	
}

/*
###################################################################################################################################
 This is only for housing follow-up inspections
###################################################################################################################################
*/
function housingFollowUpInsp(){
	var wfComment = "Updated via IRSA() housingFollowUpInsp()."
	var inspComment = "Scheduled via IRSA housingFollowUpInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	var balance  = getbalance(capId) //added 12/24
	
	if(inspResult == "Hearing Recommended" || inspResult == "Demo Hearing Recommended"){
		loopTask(wfTask,inspResult,wfComment,null)
		activateTask("Pre-Hearing", null) // -AM 2020
        updateTask("Pre-Hearing", "Hearing to be Scheduled", wfComment)
		assignCap("BCHLEBOW")
	}
	else if(inspResult == "Completed By Owner"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Closed",wfComment,null)	
		email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " closed automatically - please check for physical file and money owed.")
	}
						
	else if(inspResult == "Duplicate" || inspResult == "Opened In Error"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		if (balance>0) { //added 12/24
			updateTask("Case Closed","Opened In Error - Review Void",wfComment,null)
		}
		else {
			closeTask("Case Closed","Opened In Error",wfComment,null)
		}	
    }
	//Again, any way to check BALANCE to deal with this?  
	else if(inspResult == "Utility Check"){
		updateTask(wfTask,inspResult,wfComment,null)
		scheduleInspection("Housing Follow-Up Inspection",3,currentUserID,null,inspComment)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Utility Check Requested for "+ 
						capIDString +" by " + currentUserID, "Please confirm utilities are on for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " and update the record accordingly.")
	}
	else if(inspResult == "Repair Agreement Signed"){
		scheduleInspection("Monthly Inspection",30,currentUserID,null,inspComment) // Repair agreement inspections must be scheduled manually
		closeTask(wfTask,inspResult,wfComment,null)
	}
	else if(inspResult == "New Violations Added"){
		aa.print("New Violations added selected")
		updateTask(wfTask,inspResult,wfComment,null)
		var guideResult = guideSheetHousingCheck(wfComment,inspComment)
        wfComment = guideResult[0]
        scheduleInspection("Monthly Inspection", 30, currentUserID, null, inspComment)
        /* added monthly inspection April 2020 */
	}
	else if(inspResult == "Stern Letter Request"){
		updateTask(wfTask,inspResult,wfComment,null)
		scheduleInspection("Housing Follow-Up Inspection",5,currentUserID,null,inspComment)
	}
	else if(inspResult == "Ticket Issued"){
		if (inspType=="Ticket Follow-Up Inspection"){
            ticketFollowUpInspHSG()
		}
		else {
			updateTask(wfTask,inspResult,wfComment,null)
			//NC pause!! addFee("FAIL REP","ENF_HOUSING", "FINAL", 100, "Y")
			scheduleInspection("Ticket Follow-Up Inspection",11,currentUserID,null,inspComment)
			aa.print("ticket applied!")
		}
    }
    else if(inspResult == "No Repairs Made"){
        scheduleInspection("Monthly Inspection", 30, currentUserID, null, inspComment)
        /* added monthly inspection April 2020 */
    }
    else if(inspResult == "Repairs In Progress"){
        scheduleInspection("Monthly Inspection", 30, currentUserID, null, inspComment)
        /* added monthly inspection April 2020 */
    }
}
/*
###################################################################################################################################
ticketFollowUpInspHSG - Lucy created September 2018, live October 2018
###################################################################################################################################
*/
function ticketFollowUpInspHSG(){
	var inspComment = "Updated via IRSA() ticketFollowUpInspHSG()."
	var wfTask = getLastActiveTaskDesc(capId)
	var output = countIdenticalInspections() //This is used for the counting of how many tickets
	var balance  = getbalance(capId) //added 12/24
	aa.print('output = ' + output)
	if(inspResult == "Ticket Issued"){
		switch(output) {
			case 1: 
				aa.print("ticket 2");
				scheduleInspection("Ticket Follow-Up Inspection",11, currentUserID, null, inspComment);
				//NC pause!! addFee("FAIL REP", "ENF_HOUSING", "FINAL", 200, "Y");
				break;
			case 2: 
				aa.print("ticket 3");
				scheduleInspection("Ticket Follow-Up Inspection",11, currentUserID, null, inspComment);
				//NC pause!! addFee("FAIL REP", "ENF_HOUSING", "FINAL", 300, "Y");
				break;
			case 3: 	
				aa.print("ticket 4");
				scheduleInspection("Ticket Follow-Up Inspection",11, currentUserID, null, inspComment);
				//NC pause!! addFee("FAIL REP", "ENF_HOUSING", "FINAL", 400, "Y");
				break;
			case 4: 
				aa.print("ticket 5");
				scheduleInspection("Ticket Follow-Up Inspection",11, currentUserID, null, inspComment);
				//NC pause!! addFee("FAIL REP", "ENF_HOUSING", "FINAL", 500, "Y");
				email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "$500 Ticket Applied to Property "+ capId.getCustomID() +" " + currentUserID,"This is the fifth ticket follow-up inspection resulting in a ticket of $500. Please review case to determine next steps. A standard follow-up inspection has been scheduled out 11 days in the mean time.");
				break;
			case 5: 
				aa.print("ticket 6");
				scheduleInspection("Ticket Follow-Up Inspection",11, currentUserID, null, inspComment);
                //addFee("FAIL REP 5", "ENF_HOUSING", "FINAL", 1, "Y");
                // This one should NEVER be ticketed - even after ticketing resumes
				email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Tried to ticket again - Not applied (6th attempt) "+ capId.getCustomID() +" " + currentUserID,"This is the sixth ticket follow-up inspection resulting in a ticket of $500. Please review case to determine next steps. A standard follow-up inspection has been scheduled out 11 days in the mean time.");
				break;
		}
    }
    else if(inspResult == "No Repairs Made"){
        scheduleInspection("Monthly Inspection", 30, currentUserID, null, inspComment)
        /* added monthly inspection April 2020 */
    }
}
/*
###################################################################################################################################
ticketFollowUpInspENV - Lucy drafted December 2018
###################################################################################################################################
*/
function ticketFollowUpInspENV(){
	var inspComment = "Updated via IRSA() ticketFollowUpInspENV()."
	var wfTask = getLastActiveTaskDesc(capId)
    var output = countIdenticalInspections()
	var balance  = getbalance(capId) //added 12/24
    var emaillist = "jhebert@southbendin.gov"
    //var emaillist = "DL-CodeEnforcementOfficeStaff@southbendin.gov"
    /*var inspEmail = getUserEmail()*/
	aa.print('output = ' + output)
	if(inspResult == "Ticket Issued"){
		switch(output) {
			case 1: 
				aa.print("ticket 2");
				scheduleInspection("ENV Ticket Follow-Up Inspection",7, currentUserID, null, inspComment);//changed to 7 from 5 9-25-2020
				aa.print("ticket follow-up insp scheduled");
				addFee("16-53", "ENF_ENVIRONMENTAL", "FINAL", 100, "Y");//changed to $100 from $200 9-25-2020
				aa.print("$100 ticket applied");//changed to $100 from $200 9-25-2020
				//aa.sendMail("noreply@accela.com", emaillist , "", "test email", "test");
				//email(emaillist, "noreply@accela.com", "$100 Ticket Applied to Property "+ capId.getCustomID() +" " + currentUserID,"This is the second ticket follow-up inspection resulting in a ticket of $100. Please review case to determine next steps. A ticket follow-up inspection has been scheduled out 5 days in the mean time.");//changed to $100 from $200 9-25-2020
				aa.print("ticket email sent");
				break;
			case 2: 
				aa.print("ticket 3");
				scheduleInspection("ENV Ticket Follow-Up Inspection",7, currentUserID, null, inspComment);//changed to 7 from 5 9-25-2020
				aa.print("ticket follow-up insp scheduled");
				addFee("16-53", "ENF_ENVIRONMENTAL", "FINAL", 200, "Y");//changed to $200 from $300 9-25-2020
				aa.print("$200 ticket applied");//changed to $200 from $300 9-25-2020
				break;
			case 3: 	
				aa.print("ticket 4");
				scheduleInspection("ENV Ticket Follow-Up Inspection",7, currentUserID, null, inspComment);//changed to 7 from 5 9-25-2020
				//NC pause!! addFee("16-53", "ENF_ENVIRONMENTAL", "FINAL", 400, "Y");
				break;
			case 4: 
				aa.print("ticket 5");
				scheduleInspection("ENV Ticket Follow-Up Inspection",7, currentUserID, null, inspComment);//changed to 7 from 5 9-25-2020
				//NC pause!! addFee("16-53", "ENF_ENVIRONMENTAL", "FINAL", 500, "Y");
				email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "$500 Ticket Applied to Property "+ capId.getCustomID() +" " + currentUserID,"This is the fifth ticket follow-up inspection resulting in a ticket of $500. Please review case to determine next steps. A standard follow-up inspection has been scheduled out 5 days in the mean time (so it should get SFH).");
				break;
			case 5: 
				aa.print("ticket 6");
				scheduleInspection("Follow-Up Inspection",7, currentUserID, null, inspComment); //changed to 7 from 5 9-25-2020/*Scheduling a standard follow-up instead of a ticket follow-up per feedback from Insp team*/
                /*
				scheduleInspection("ENV Ticket Follow-Up Inspection",5, currentUserID, null, inspComment); /*Scheduling a standard follow-up instead of a ticket follow-up per feedback from Insp team*/
				/*addFee("16-53", "ENF_ENVIRONMENTAL", "FINAL", 500, "Y");*/
				email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "$500 Ticket Applied to Property "+ capId.getCustomID() +" " + currentUserID,"This is the sixth ticket follow-up inspection that would have resulted in a ticket of $500 EXCEPT we want it set for hearing!! Please review case to determine next steps. A ticket follow-up inspection has been scheduled out 5 days in the mean time.");
                break;
            case 6:
                aa.print("over 6 tickets")
                scheduleInspection("Follow-Up Inspection",7, currentUserID, null, inspComment); //changed to 7 from 5 9-25-2020/*Scheduling a standard follow-up instead of a ticket follow-up per feedback from Insp team*/
                email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Review Tickets Issued"+ capId.getCustomID() +" " + currentUserID,"This case already has 2 tickets worth $500. Please review case to determine next steps. No ticket has been applied, but a standard follow-up inspection has been scheduled out 5 days in the mean time.");            
                break; 
		}
	}
}
/*
###################################################################################################################################
 Function to check housing initial and follow-up inspection guidesheet results to schedule the right inspection. Returns wfComment
 Lucy edited in September 2018 and live October 2018
###################################################################################################################################
*/
function guideSheetHousingCheck(wfComment,inspComment){
	var emergency = 0
	var critical = 0
	var repairs = 0
	var vacate = 0
	var violationCheck = false
	var guideArray = getGuideSheetObjects(inspId)
	var returnArray = new Array()
	var wfTask = getLastActiveTaskDesc(capId)
/* New guidesheet drop-down options in Sept 2018, live October 2018: 'Emergency Vacate' and 'Vacate and Hearing'*/	
	for (guideItem in guideArray){
		if(guideArray[guideItem].status == "EMERGENCY VACATE"){
			emergency += 1
		}
		else if(guideArray[guideItem].status == "CRITICAL REPAIRS NEEDED"){
			critical += 1
		}
		else if(guideArray[guideItem].status == "REPAIRS NEEDED"){
			repairs += 1
		}
		else if(guideArray[guideItem].status == "VACATE AND HEARING"){
			vacate += 1
		}
	}
	
	if(emergency > 0){
		aa.print("Emergency Vacate Order Requested")
		editTaskSpecific(wfTask, "Request Vacate and Seal", "Y")
		loopTask(wfTask,"Emergency Vacate Order Requested",null,null)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Emergency Vacate Order Requested  "+ capId.getCustomID() +" " + currentUserID,"Vacate order requested, please complete a utility check.")
		scheduleInspection("Post Vacate Order",1,currentUserID,null,inspComment)
		wfComment += "Emergency vacate requested - 1 day to comply with emergency items."
		violationCheck = true
	}
	else if(vacate > 0){
		if(isTaskActive("Initial Inspection")){
			/*editTaskSpecific(wfTask, "Request Vacate and Seal", "Y")
			aa.print("TSI edited")*/
			closeTask(wfTask,"Vacate Order Requested", null, null)
			wfComment += "Vacate Order Requested"
			email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Vacate Order Requested  "+ capId.getCustomID() +" " + currentUserID,"Vacate order requested, please complete a utility check.")
			scheduleInspection("Vacate Follow-Up Inspection", 3, currentUserID, null, inspComment)
		}
		else {
			/*editTaskSpecific(wfTask, "Request Vacate and Seal", "Y")
			aa.print("TSI edited")*/
			updateTask(wfTask,"Vacate Order Requested", null, null)
			wfComment += "Vacate Order Requested"
			email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Vacate Order Requested  "+ capId.getCustomID() +" " + currentUserID,"Vacate order requested, please complete a utility check.")
			scheduleInspection("Vacate Follow-Up Inspection", 3, currentUserID, null, inspComment)
		}
	}
	
	else if(critical > 0){
		closeTask(wfTask,inspResult,null,null)
		wfComment += " Critical items found - 10 days to comply with critical items."
		scheduleInspection("Housing Follow-Up Inspection",12,currentUserID,null,inspComment)
		violationCheck = true
	}
	else if(repairs > 0){
		closeTask(wfTask,inspResult,null,null)
		wfComment += " In violation - 30 days to comply with non-emergency and non-critical items."
		scheduleInspection("Housing Follow-Up Inspection",33,currentUserID,null,inspComment)
		violationCheck = true
	}
	returnArray.push(wfComment,violationCheck)
	
	return returnArray
}
/*
###################################################################################################################################
 This is for post vacate order inspections, essentially just to capture the date/time of posting an order
 Lucy created September 2018, live October 2018
###################################################################################################################################
*/
function postVacateOrderInsp(){
	var wfComment = "Updated via IRSA() postVacateOrderInsp()."
	var inspComment = "Scheduled via IRSA postVacateOrderInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	var balance  = getbalance(capId) //added 12/24
	
	if(inspResult == "Posted"){
		aa.print("Just posting order")
        updateTask(wfTask, "Vacate Order Posted", wfcomment, null)
        scheduleInspection("Housing Follow-Up Inspection",10, currentUserID, null, inspComment) 
        /* Also scheduled for 10 days b/c Vacate & Seal's are important */
	}
	if (inspResult == "Posted and Ticket Issued"){
		aa.print("Posting order and issuing ticket")
		updateTask(wfTask, "Vacate Order Posted", wfComment, null)
		//NC pause!! addFee("FAIL REP 1","ENF_HOUSING", "FINAL", 1, "Y")
		scheduleInspection("Ticket Follow-Up Inspection", 10, currentUserID, null, inspComment)
	}
	if (inspResult == "Completed By Owner"){
		branchTask(wfTask, "Completed By Owner", wfcomment, null)
		email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
		aa.address.getAddressByCapId(capId).getOutput()[0] + " closed automatically - please check for physical file and money owed.")
	}
}
/*
###################################################################################################################################
 This is for secure follow-up inspections
###################################################################################################################################
*/
function secureFollowupInsp(){
	var wfComment = "Updated via IRSA() secureFollowupInsp()."
	var inspComment = "Scheduled via IRSA secureFollowupInsp()."
	var wfTask = getLastActiveTaskDesc(capId)	

	if(inspResult == "Completed By Owner"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Closed",wfComment,null)	
	}
	else if(inspResult == "Insp Boarded"){ //added 12/24/2020
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		closeTask("Case Closed","Closed",wfComment,null)	
	}
	//Any way to find whether there's money owed??					
	else if(inspResult == "Duplicate" || inspResult == "Opened In Error"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		if (balance>0) { //added 12/24
			updateTask("Case Closed","Opened In Error - Review Void",wfComment,null)
		}
		else {
			closeTask("Case Closed","Opened In Error",wfComment,null)
		}	
    }
	  
	else if(inspResult == "Utility Check"){
		updateTask(wfTask,inspResult,wfComment,null)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Utility Check Requested for "+ 
						capIDString +" by " + currentUserID, "Please confirm utilities are on for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " and update the record accordingly.")
	}
	else if(inspResult == "Secure Property"){
		closeTask(wfTask, inspResult, wfComment, null)
	}
}
/*
###################################################################################################################################
 This for both abatement. Litter and vegetation records get a CE fine added with this function but do not
 get invoiced by this function because the Inspector mobile app commits ASI at the same time as inspections when using the Inspector app - this
 results in the getApplicationSpecific() function always resulting to null because the data hasn't been committed yet.
###################################################################################################################################
*/
function abatementPostAbatementInsp(){
	//Setting all of the ASI fields to variables to perform logic and/or operations on them
	var feeSeqArray = []
	var balance  = getbalance(capId) //added 12/24
	var feeComment = "Fee assessed and invoiced via IRSA abatementPostAbatementInsp()"
	var paymentPeriodArray = []
	var wfComment = "Updated via IRSA() abatementPostAbatementInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	var daysPast = 0
	var todayDate = new Date()
	var enfFeeSch = "ENF_ENVIRONMENTAL"
	/*var ceFeeSch = "ENF_ENVIRONMENTAL"*/
	var feePeriod = "FINAL"
	var grassFeeArray = [["GRASS 25",enfFeeSch,feePeriod,1],
							["GRASS 15",enfFeeSch,feePeriod,0.5],
							["GRASS 17",enfFeeSch,feePeriod,0.25],
							["GRASS 20",enfFeeSch,feePeriod,1]]
							
	var grassOVBTicket = ["GRASS 27",enfFeeSch,feePeriod,1]
	
	//Checks outcome of inspection for non-Continuous Enforcement records
	if(!appMatch("Enforcement/Violations/Environmental/Continuous Enforcement") && (isTaskActive("Abatement")||isTaskActive("Post-Hearing Abatement"))){
		if (inspResult == "Completed By Owner"){
			if(isTaskActive("Abatement")){
				branchTask(wfTask,inspResult,wfComment,null)
				if (balance>0) { //added 12/24
					updateTask("Case Closed","Review Case for Collections",wfComment,null)
				}
				else {
					closeTask("Case Closed","Closed",wfComment,null)
				}					
			}
			else{
				closeTask(wfTask,inspResult,wfComment,null)
				if (balance>0) { //added 12/24
					updateTask("Case Closed","Review Case for Collections",wfComment,null)
				}
				else {
					closeTask("Case Closed","Closed",wfComment,null)
				}					
			}
		}
		else if (inspResult == "Opened In Error"){
			if(isTaskActive("Abatement")){
				branchTask(wfTask,inspResult,wfComment,null)
				if (balance>0) { //added 12/24
					updateTask("Case Closed","Opened In Error - Review Void",wfComment,null)
				}
				else {
					closeTask("Case Closed","Opened In Error",wfComment,null)
				}	
			}
			else{
				closeTask(wfTask,inspResult,wfComment,null)
				if (balance>0) { //added 12/24
					updateTask("Case Closed","Opened In Error - Review Void",wfComment,null)
				}
				else {
					closeTask("Case Closed","Opened In Error",wfComment,null)
				}					
			}
		}
		else if (inspResult == "Non-Billable Abatement"){//separated out 12/24; WHAT DO I DO WITH THESE THAT WOULD BE BETTER?
			if(isTaskActive("Abatement")){
				branchTask(wfTask,inspResult,wfComment,null)
				if (balance>0) { //added 12/24
					updateTask("Case Closed","Opened In Error - Review Void",wfComment,null)
				}
				else {
					closeTask("Case Closed","Opened In Error",wfComment,null)
				}	
			}
			else{
				closeTask(wfTask,inspResult,wfComment,null)
				if (balance>0) { //added 12/24
					updateTask("Case Closed","Opened In Error - Review Void",wfComment,null)
				}
				else {
					closeTask("Case Closed","Opened In Error",wfComment,null)
				}					
			}
		}
		else if(inspResult == "Hearing Recommended"){
			closeTask(wfTask,inspResult,wfComment,null)
			assignCap("BCHLEBOW")
		}
		else if(inspResult == "Extension Granted"){
			updateTask(wfTask,inspResult,wfComment,null)
			scheduleInspection("Follow-Up Inspection", 13, currentUserID, null, inspComment)
		}
		else if(inspResult == "Abatement Complete" || inspResult == "Abated by Inspector"){
			branchTask(wfTask,inspResult,wfComment,null)
			
			// Adds abatement fees
			if (appMatch("Enforcement/Violations/Environmental/Grass and Weeds")){
				feeSeqArray = addGrassFees(grassFeeArray, feeSeqArray)
				// Add City Council/OVB grass ticket
				//NC pause!! addFeeWithExtraData(grassOVBTicket[0], grassOVBTicket[1], grassOVBTicket[2], grassOVBTicket[3], 
				//NC pause!! 					"Y",capId,feeComment,null,null)
									
				updateTask("Case Closed","Billed",wfComment,null)
			}
			else if(appMatch("Enforcement/Violations/Environmental/Litter")||appMatch("Enforcement/Violations/Environmental/Vegetation")){
				// Updates the task to be caught by the batchInvoice script later to actually bill
				// This is necessary because ASI/ASIT is used and these can't be captured when an event fires
				// ASI/ASIT was used because it is easiest on the mobile app
				updateTask("Case Closed","Invoice Pending",wfComment,null)
				
				// Adds a continuous enforcement fine to the record
				if(currentCECondition){
					//NC pause!! addCEFine()
				}
			}
			else{
				if (balance>0) { //added 12/24
					updateTask("Case Closed","Review Case for Collections",wfComment,null)//AM added May 2020
				// so cases don't close out when abatement is done w/o review
				}
				else {
					closeTask("Case Closed","Closed",wfComment,null)
				}
			}
		}
	}
	else if (appMatch("Enforcement/Violations/Environmental/Continuous Enforcement")){
		// This doesn't have a task check because it is a Continuous Enforcement record
		if(inspResult == "Abatement Complete"){
			feeSeqArray = addGrassFees(grassFeeArray, feeSeqArray)
			// Add CE grass ticket
			//NC pause!! addCEFine()
		}
		scheduleInspection("Abatement", 30, "PARKSCREW", null, wfComment)
		// Only commenting this out for now until I get all CE records to the same task
		//updateTask("Abatement", inspResult, wfComment, null)
	}
	
	if (feeSeqArray.length != 0){
		// All fees need an invoice stage and this builds a dynamic array to invoice all fees on the same invoice number. 
		for (var i=0; i < feeSeqArray.length;i++){
			paymentPeriodArray.push(feePeriod)
		}
		// Invoicing all litter fees on the same invoice number
		aa.finance.createInvoice(capId,feeSeqArray,paymentPeriodArray)
	}
}
	/*
	###################################################################################################################################
		Functions that are used to add fees and invoice them
	###################################################################################################################################
	*/
	function addGrassFees(grassFeeArray,feeSeqArray){
		var feeSeqArray = []
		var feeComment = "Fee assessed and invoiced via IRSA abatementPostAbatementInsp()"
		var enfFeeSch = "ENF_ENVIRONMENTAL"
		/*var ceFeeSch = "ENF_ENVIRONMENTAL"*/
		var feePeriod = "FINAL"
		var grassFeeArray = [["GRASS 25",enfFeeSch,feePeriod,1],
							["GRASS 15",enfFeeSch,feePeriod,0.5],
							["GRASS 17",enfFeeSch,feePeriod,0.25],
							["GRASS 20",enfFeeSch,feePeriod,1]]
							
		for(i in grassFeeArray){
			feeSeqArray.push(addFeeWithExtraData(grassFeeArray[i][0],grassFeeArray[i][1],grassFeeArray[i][2],
				grassFeeArray[i][3],"N",capId,feeComment,null,null))
		}
		return feeSeqArray
	}
	function addCEFine(){
		// checkCE is used because sometimes many parcels are associated with a record.
		// This checker allows only 1 CE fine to be placed on a record
		var checkCE = 0
		var parCondArray = getParcelConditions("Code Enforcement","Applied","Continuous Enforcement",null)
        var todayDate = new Date()
        var ceFeeSch = "ENF_ENVIRONMENTAL"
	    var feePeriod = "FINAL"
        var feeComment = "Fee assessed and invoiced via IRSA abatementPostAbatementInsp()"
        	
		for(cond in parCondArray){
			var expireDate = new Date(String(parCondArray[cond].expireDate.getYear()),String(parCondArray[cond].expireDate.getMonth()-1),
						String(parCondArray[cond].expireDate.getDayOfMonth()))
			if(expireDate > todayDate && checkCE == 0){
				var effictiveDateObj = parCondArray[cond].arObject.getEffectDate()
				var effectiveDate = new Date(String(effictiveDateObj.getYear()),String(effictiveDateObj.getMonth()-1),
						String(effictiveDateObj.getDayOfMonth()))
				// If greater than one year, add second year CE fine
				if(Math.ceil((todayDate - effectiveDate)/(1000*3600*24))> 365){
					if(appMatch("Enforcement/Violations/Environmental/Litter")||appMatch("Enforcement/Violations/Environmental/Vegetation")){
						addFeeWithExtraData("CE 15", ceFeeSch, feePeriod, 1, "Y",capId,feeComment,null,null)
					}
					else{
						addFeeWithExtraData("CE 18", ceFeeSch, feePeriod, 1, "Y",capId,feeComment,null,null)
					}
				}
				// If not greater than one year, add first year fine
				else{
					if(appMatch("Enforcement/Violations/Environmental/Litter")||appMatch("Enforcement/Violations/Environmental/Vegetation")){
						addFeeWithExtraData("CE 10", ceFeeSch, feePeriod, 1, "Y",capId,feeComment,null,null)
					}
					else{
						addFeeWithExtraData("CE 17", ceFeeSch, feePeriod, 1, "Y",capId,feeComment,null,null)
					}
				}
				checkCE = 1
			}
		}
	}



function housingEmergencyInsp(){
	var wfComment = "Updated via IRSA() housingEmergencyInsp()."
	var inspComment = "Scheduled via IRSA housingEmergencyInsp()."
	var wfTask = getLastActiveTaskDesc(capId)

	if(inspResult == "Hearing Recommended" || inspResult == "Demo Hearing Recommended"){
		closeTask(wfTask,inspResult,wfComment,null)
		activateTask("Pre-Hearing", null) // -AM 2020
        updateTask("Pre-Hearing", "Hearing to be Scheduled", wfComment)
		assignCap("BCHLEBOW")
	}
	else if(inspResult == "Duplicate" || inspResult == "Opened In Error"){
		branchTask(wfTask,inspResult,wfComment,null)
		assignCap("CODESTAFF")
		updateTask("Case Closed","Opened In Error - Review Void",wfComment,null)	
	}
	else if(inspResult == "Utility Check"){
		updateTask(wfTask,inspResult,wfComment,null)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Utility Check Requested for "+ 
						capIDString +" by " + currentUserID, "Please confirm utilities are on for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " and update the record accordingly.")
	}
	else if(inspResult == "Repair Agreement Signed"){
		scheduleInspection("Repair Agreement Inspection",31,currentUserID,null,inspComment)
		closeTask(wfTask,inspResult,wfComment,null)
	}
	else if(inspResult == "New Violations Added"){
		updateTask(wfTask,inspResult,wfComment,null)
		var guideResult = guideSheetHousingCheck(wfComment,inspComment)
		wfComment = guideResult[0]
	}
	else if(inspResult == "Stern Letter Request"){
		updateTask(wfTask,inspResult,wfComment,null)
		scheduleInspection("Housing Follow-Up Inspection",5,currentUserID,null,inspComment)
	}
	else if(inspResult == "Ticket Issued"){
		updateTask(wfTask,inspResult,wfComment,null)
		//NC pause!! addFee("FAIL REP 1","ENF_HOUSING", "FINAL", 1, "Y")
		scheduleInspection("Ticket Follow-Up Inspection",11,currentUserID,null,inspComment)
		aa.print("ticket applied emergency!")
	}
	else if(inspResult == "Emergency Resolved"){
		var guideResult = guideSheetHousingCheck(wfComment,inspComment)
		wfComment = guideResult[0]
		
		if(guideResult[1]){
			branchTask(wfTask,inspResult,wfComment,null)
			closeTask("Case Closed","Closed",wfComment,null)
		}
	}
}
/*
###################################################################################################################################
 This for monthly inspections in IRSA. Monthly inspections are manually scheduled after hearings.
###################################################################################################################################
*/
function monthlyInsp(){
	var wfComment = "Updated via IRSA() monthlyInsp()."
	var inspComment = "Scheduled via IRSA monthlyInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	var balance  = getbalance(capId) //added 12/24
	//email("amynsber@southbendin.gov","noreply@accela.com","within Monthly Inspection function","test")
	if(inspResult == "Repairs Completed By Owner" || inspResult == "Demolished By Owner"){
		if(isTaskActive("Hearing")||isTaskActive("Public Demolition Bid")){
			branchTask(wfTask, inspResult, wfComment, null)	
			email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
			aa.address.getAddressByCapId(capId).getOutput()[0] + " may need closed - please check for physical file and money owed.")	
		}
		else if(isTaskActive("Demolition")){
			closeTask(wfTask, inspResult, wfComment, null)
			email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
			aa.address.getAddressByCapId(capId).getOutput()[0] + " closed automatically - please check for physical file and money owed.")
		}
		else{
			email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
			aa.address.getAddressByCapId(capId).getOutput()[0] + " is in compliance, but not closed - please check for physical file and money owed and close Accela case.")
		}
	}
	else if(inspResult == "No Repairs Made" || inspResult == "Repairs In Progress" || inspResult == "Demolition In Progress"){
        aa.print("Scheduling Monthly Inspection")
		//email("amynsber@southbendin.gov","noreply@accela.com","Got to Repairs In Progress or No Repairs Made","test")
		scheduleInspection("Monthly Inspection", 30, currentUserID, null, inspComment)
	}			
}

/*
###################################################################################################################################
 This for hearing deadline inspections in IRSA. Hearing deadline inspections are manually scheduled after hearings.
###################################################################################################################################
*/
function hearingDeadlineInsp(){
	var wfComment = "Updated via IRSA() hearingDeadlineInsp()."
	var inspComment = "Scheduled via IRSA hearingDeadlineInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	
	if(inspResult == "Repairs Completed By Owner" || inspResult == "Demolished By Owner"){
		loopTask(wfTask, inspResult,wfComment,null)
		email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
		aa.address.getAddressByCapId(capId).getOutput()[0] + " closed automatically - please check for physical file and money owed.")
		closeTask("Case Closed", "Closed", wfComment,null)
	}
	else if(inspResult == "Hearing Deadline Not Met"){
		scheduleInspection("Monthly Inspection", 30, currentUserID, null, inspComment)
		//activateTask("Follow-Up Inspection", null) // trying to do follow-up instead of pre-hearing or leaving in post-hearing.
		//closeTask(wfTask, inspResult, wfComment, null) //changed from looptask to closetask & trying to open instead.
		loopTask(wfTask, inspResult, wfComment, null) //changed to LoopTask - branch task just clsoed it out. Hoping this goes better. -AM 2020
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Post-Hearing Inspection Complete  "+ capID +" " + currentUserID,
			"Post-Hearing Inspection Complete. Check Inspections section of record for details")
		activateTask("Pre-Hearing", null) // this isn't working.  Not sure why.  Hoping the loop task above fixes it.  It did.  Yay! -AM 2020
        updateTask("Pre-Hearing", "Hearing to be Scheduled", wfComment)
        /* added monthly inspection April 2020 */
	}
	else if(inspResult == "Demolition Order Affirmed"){
		scheduleInspection("Monthly Inspection", 30, currentUserID, null, inspComment)
        closeTask(wfTask, inspResult, wfComment, null)
        assignCap("ADMIN")
        /* added monthly inspection April 2020 */
	}
}

/*
###################################################################################################################################
 This for pre-hearing inspections in IRSA.
###################################################################################################################################
*/
function preHearingInsp(){
	if(inspResult == "In Violation" || inspResult == "Improvements Made"){
		email("DL-CodeEnforcementAdministration@southbendin.gov","noreply@accela.com","Pre-Hearing Inspection Completed on "+ 
		capIDString +" by " +currentUserID, "Please see " + capIDString + " for updated inspection result information.")
	}
}

/*
###################################################################################################################################
 This for repair agreement inspections in IRSA.
###################################################################################################################################
*/
function repairAgreementInsp(){
	var wfComment = "Updated via IRSA() repairAgreementInsp()."
	var inspComment = "Scheduled via IRSA repairAgreementInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	var balance  = getbalance(capId) //added 12/24
	if(inspResult == "Repairs In Progress" || inspResult == "No Change"){
		if(countIdenticalInspections() > 3){ //This probably isn't working anymore as we switched from having these - repair agreements often aren't for 30 days.
			email("DL-CodeEnforcementAdministration@southbendin.gov","noreply@accela.com", "Fourth Repair Agreement Scheduled for "+ 
				capIDString + " by " + currentUserID,
				"Three previous repair agreements have been schedule for the primary address "+
				aa.address.getAddressByCapId(capId).getOutput()[0]+
				" . This usually means that 90 days have elapsed in the repair agreement task.")
		}
		updateTask(wfTask,inspResult,wfComment,null)
		scheduleInspection("Repair Agreement Inspection",31,currentUserID,null,inspComment)
	}
	else if(inspResult == "Hearing Recommended" || inspResult == "Demo Hearing Recommended"){
		closeTask(wfTask,inspResult,wfComment,null)
		activateTask("Pre-Hearing", null) // -AM 2020
		updateTask("Pre-Hearing", "Hearing to be Scheduled", wfComment)
		assignCap("BCHLEBOW")
	}
	else if(inspResult == "All Repairs Completed"){
		branchTask(wfTask,inspResult,wfComment,null)
		email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
		aa.address.getAddressByCapId(capId).getOutput()[0] + " closed automatically - please check for physical file and money owed.")
		closeTask("Case Closed", "Closed", wfComment,null)
	}
	else if(inspResult == "Utility Check"){
		updateTask(wfTask,inspResult,wfComment,null)
		email("DL-CodeEnforcementOfficeStaff@southbendin.gov", "noreply@accela.com", "Utility Check Requested for "+ 
						capIDString +" by " + currentUserID, "Please confirm utilities are on for the primary address " +
						aa.address.getAddressByCapId(capId).getOutput()[0] + " and update the record accordingly.")
    }
    else{
        scheduleInspection("Monthly Inspection", 30, currentUserID, null, inspComment)
        /* added monthly inspection April 2020 */
    }
}

/*
###################################################################################################################################
 This for yard sign inspections in IRSA.Lucy created summer 2018
###################################################################################################################################
*/
function yardSignInsp(){
	aa.print('Made it to yardSignInsp function')
	var wfComment = "Updated via IRSA() yardSignInsp()."
	var inspComment = "Scheduled via IRSA yardSignInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	

	if(inspResult == "Yard Sign Posted"){
		updateTask(wfTask,inspResult,wfComment,null)
		scheduleInspection("Follow-Up Inspection",12,currentUserID,null,inspComment)
		}
}

/*
###################################################################################################################################
 This for board-up verification inspections in IRSA.
###################################################################################################################################
*/
function secureInsp(){
	var wfComment = "Updated via IRSA() secureInsp()."
	var inspComment = "Scheduled via IRSA secureInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	var balance  = getbalance(capId) //added 12/24
	
	if(inspResult == "Incomplete Board Up"){
		updateTask(wfTask, inspResult,wfComment, null)
	}
	else if(inspResult == "Completed By City" || inspResult == "Completed By Contractor" || inspResult == "Contractor Completion" || inspResult == "City Completion"){
		closeTask(wfTask, inspResult, wfComment, null)
		updateTask("Case Closed","Invoice Pending", wfComment, null)
	}
	else if(inspResult == "Completed By Owner" || inspResult == "Owner Completion"){
		closeTask(wfTask, inspResult, wfComment, null)
		updateTask("Case Closed","Closed", wfComment, null)
	}
}

function topSoilInsp() {
	var wfComment = "Updated via IRSA() topSoilInsp()."
	var inspComment = "Scheduled via IRSA topSoilInsp()."
	var wfTask = getLastActiveTaskDesc(capId)
	
	if(inspResult == "Approved"){
		closeTask(wfTask,"Demolition Complete",wfComment,null)
		updateTask("Case Closed","Invoice Pending", wfComment, null)
	}
}

// Not used, but will leave this here just in case complaint inspections want/need to be resulted in browser
function complaintInsp() {
    if (inspResult != 'Complaint Verified') {
        // Variables
        var wfComment = "Updated via IRSA() complaintInsp()."
        var inspComment = "Scheduled via IRSA complaintInsp()."
        var wfTask = getLastActiveTaskDesc(capId)
        var closeTaskName = "Complaint Outcome"
        var closeTaskStatus = "Closed"
        var complaintEmailText = ""

        // Just in case the office staff didn't update the workflow status, I check to see what task its in and make the necessary changes
        if (wfTask == "Complaint Review") {
            closeTask(wfTask, "Inspector Assigned", wfComment, null)
            closeTask("Complaint Verification", inspResult, wfComment, null)
        }
        else if (wfTask == "Complaint Verification") {
            closeTask(wfTask, inspResult, wfComment, null)
        }
        // Closing the record out
        closeTask(closeTaskName, closeTaskStatus, wfComment, null)

        // Determine what email language to send
        if (inspResult == "Incorrect Location") {
            complaintEmailText = "Thank you for contacting Code Enforcement for the City of South Bend about record " + capIDString + ". The address you submitted was not correct and therefore a case was not created. An inspector will check the area for a violation. You can contact 311 (574-233-0311) to learn the status of your complaint."
        }
        else if (inspResult == "Not a Code Violation") {
            complaintEmailText = "Thank you for contacting Code Enforcement for the City of South Bend about record " + capIDString + ". The information you submitted was not deemed a code enforcement violation. Please visit https://www.southbendin.gov/government/content/brochures-information to learn more about code violations, or call 311 (574-233-0311)."
        }

        emailContact("Code Enforcement update for " + capIDString, complaintEmailText, "Resident")
    }
}

/*
###################################################################################################################################
###################################################################################################################################
										WTUA - Used for WorkflowTaskUpdateAfter
###################################################################################################################################
###################################################################################################################################
*/
function WTUA(){
	var wfComment = "Updated via WTUA"
	var inspComment = "Scheduled via WTUA."
	var balance  = getbalance(capId) //added 12/24
	// Came from WTUB
	if(wfStatus == "Opened In Error" || wfStatus == "Duplicate"){//modified 12/24 to include duplicates
		inspCancelAll()
	}
	/*
	Don't need according to Lucy - 2017-07-24
	// Demolition Completed By City was in WTUB; can't see a reason why it needs to be in before, so moved it here
	else if(wfStatus == "Demolition Completed By City"){
		addFee("DEMO 30", "ENF_HOUSING", "Final", 1, N, null)
		closeTask(wfTask,wfStatus,wfComment,null)
		updateTask("Case Closed", "Invoice Pending", wfComment, null)
	}
	*/
   else if (wfStatus == "Hearing Rescinded") {
		branchTask(wfTask, wfStatus, wfComment, null)
		email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
		aa.address.getAddressByCapId(capId).getOutput()[0] + " closed automatically - please check for physical file and money owed.")
		closeTask("Case Closed", "Closed", wfComment, null)
	}
	else if (wfStatus == "Hearing Cancelled") {
		branchTask(wfTask, wfStatus, wfComment, null)
	}
	// Could merge with the statement above, but we might break these apart...so I kept them apart
	else if(wfStatus == "Repairs Completed By Owner" || wfStatus == "Demolished By Owner"){
		branchTask(wfTask,wfStatus,wfComment,null)
		email("bchlebow@southbendin.gov", "noreply@accela.com", "Housing case for the primary address " +
		aa.address.getAddressByCapId(capId).getOutput()[0] + " closed automatically - please check for physical file and money owed.")
		closeTask("Case Closed","Closed",wfComment,null)
	}
	else if(appMatch("Enforcement/Violations/Environmental/Continuous Enforcement") &&
		(wfStatus == "Removed From CE" || wfStatus == "CE Expired") && isTaskStatus("Abatement")){
			updateTask("Case Closed", "Closed", wfComment, null)
			inspCancelAll()
	}
	else if (wfStatus == 'Hearing Scheduled') {
        var todayDate = new Date()
            aa.print(todayDate)
			aa.print(getAppSpecific("Hearing Date"))            
		var isoDate = getAppSpecific("Hearing Date").split("/")
			aa.print(isoDate)
		var hearingDate = new Date(isoDate[2], isoDate[0] - 1, isoDate[1], todayDate.getHours(), todayDate.getMinutes(), todayDate.getSeconds(), todayDate.getMilliseconds())
			aa.print(hearingDate)
        var inspType = "Pre-Hearing Inspection"
		//Schedules an inspection for the day before the hearing
		scheduleInspection(inspType, ((hearingDate - todayDate) / (24 * 3600 * 1000) - 1) , null, null, inspComment);
		autoAssignInspection(getScheduledInspId(inspType));
	}
}

/*
###################################################################################################################################
###################################################################################################################################
										WTUB - Used for WorkflowTaskUpdateBefore
###################################################################################################################################
###################################################################################################################################
*/
function WTUB() {
	var wfComment = "Updated via WTUB"
	var inspComment = "Scheduled via WTUB."

	/* Needs to be in WTUB because this uses the TSI info of the Pre-Hearing task
	if (wfStatus == "Hearing Scheduled") {
		var todayDate = new Date()
		var isoDate = AInfo["Updated.Hearing Date"].split("/")
		var hearingDate = new Date(isoDate[2], isoDate[0] - 1, isoDate[1],
			todayDate.getHours(), todayDate.getMinutes(), todayDate.getSeconds(), todayDate.getMilliseconds())
		var followUpInspType
        
        // There are different follow up inspection types for housing and not - so choose which one
		if (appMatch("Enforcement/Violations/Housing/Housing Repair")) {
		    followUpInspType = "Housing Follow-Up Inspection"
		}
		else {
		    followUpInspType = "Follow-Up Inspection"
		}
		// Schedules an inspection for the day before the hearing
		scheduleInspection("Pre-Hearing Inspection", (hearingDate - todayDate) / (24 * 3600 * 1000) - 1,
			getInspector(followUpInspType), null, inspComment)

		editTaskSpecific("Hearing", "Hearing Case Number", AInfo["Updated.Hearing Case Number"])

		editTaskSpecific("Hearing", "Hearing Date", AInfo["Updated.Hearing Date"])

		editTaskSpecific("Hearing", "Associated Records", AInfo["Updated.Associated Records"])

		editTaskSpecific("Hearing", "Action Requested", AInfo["Updated.Action Requested"])

		editTaskSpecific("Hearing", "Primary Structure", AInfo["Updated.Primary Structure"])

		editTaskSpecific("Hearing", "Secondary Structure", AInfo["Updated.Secondary Structure"])

		editTaskSpecific("Hearing", "Tertiary Structure", AInfo["Updated.Tertiary Structure"])
		
	}*/
	}

	
