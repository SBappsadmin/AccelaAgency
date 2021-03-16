/*
	Global constants for adding fees to Litter and Vegetation records
*/
var wfTask = "Case Closed"
var processName = ""
var wfStatus = "Invoice Pending"
var wfEnd = "Billed"
var capResult = aa.cap.getCaps("Violations",wfTask,wfStatus,null)
var capObject = new Array()
var fromEmail = "noreply@accela.com"
var toEmail = "DL-CodeEnforcementAdministration@southbendin.gov;DL-CodeEnforcementOfficeStaff@southbendin.gov"
var emailSubject = "Batch invoicing of litter and vegetation records complete"
var emailText = "The batch invoicing job has completed. The following "
var emailRecords = "<br>"
var ccEmail = ""
var invoiceCount = 0
var checkedCaps = ["Enforcement/Violations/Environmental/Grass and Weeds","Enforcement/Violations/Environmental/Litter",
					"Enforcement/Violations/Environmental/Vegetation"]
// This is the step number that corresponds to Invoice Pending on ENF_ABATE2
var stepNumber = 7
// The date that OVB grass fines went into affect
var ordDate = new Date(2015,6,10)

/*
	Call the Master Scripts
*/
var SCRIPT_VERSION = 2.0
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"))
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"))
eval(getScriptText("INCLUDES_CUSTOM"))

/*
	Main logic start
*/
aa.print("Starting script")
aa.print("<br>")

if (capResult.getSuccess())
{
	capArray = capResult.getOutput()
	
	for(x in capArray)
	{
		// Assign a friendly variable name to avoid typing .getCapID() multiple times
		capObject[x] = capArray[x].getCapID()
		
		if(checkedCaps.indexOf(String(capArray[x].getCapType())) != -1)
		{
			var feeSeqArray = []
			var checker = 0
			
			if(capArray[x].getCapType() == "Enforcement/Violations/Environmental/Grass and Weeds")
			{
				var createDate = new Date(capArray[x].getFileDate().getEpochMilliseconds());
				
				// This is to check to see if a fine already exists but doesn't exists on a record with a credited fine
				// This is part of this code to clean up our records. This won't be needed after the first run of this.
				if(!feeExistsCap("GRASS 27",capObject[x],"INVOICED") && createDate >= ordDate && !feeExistsCap("GRASS 27",capObject[x],"CREDITED"))
				{
					checker = 1
					aa.print("<br><br>")
					aa.print("Invoicing for "+capObject[x].getCustomID()+".")
					aa.print("<br><br>")
					addFeeWithExtraData("GRASS 27", "ENF_ENVIRONMENTAL", "FINAL", 1, "Y", capObject[x],"Ticket assessed and invoiced via batch invoice script.",null,null)
					invoiceCount +=1
				}
			}
			else if ((capArray[x].getCapType() == "Enforcement/Violations/Environmental/Litter" ||
			capArray[x].getCapType() == "Enforcement/Violations/Environmental/Vegetation"))
			{
				aa.print("<br><br>")
				aa.print("Invoicing for "+capObject[x].getCustomID()+".")
				aa.print("<br><br>")
				
				//Setting all of the ASI fields to variables to perform logic and/or operations on them
				var numTires = getAppSpecific("Number of Tires",capObject[x])
				var dumpLoad = getAppSpecific("Load",capObject[x])
				var dumpFees = getAppSpecific("Weight (ton)",capObject[x])
				var numCrew = getAppSpecific("Number of Crew",capObject[x])
				var time = getAppSpecific("Time Spent (hrs)",capObject[x])
				var dumpTruck = getAppSpecific("Dump Truck and Small Loader",capObject[x])
				var lightningLoader = getAppSpecific("Lightning Loader",capObject[x])
				var pickupTruck = getAppSpecific("Pickup Truck",capObject[x])
				var rollTruck = getAppSpecific("Roll Off Truck",capObject[x])
				
				if (numCrew < 1 || numCrew == null)
				{
					numCrew = 1
				}
				if (time == null || time == 0)
				{
					time = 0.25
				}
				if (time <0.5)
				{
					equipTime = 0.5
				}
				if (time >=0.5)
				{
					equipTime = time
				}
				
				//Calculation of charges
				var laborCharge = numCrew*time
				var adminCost = 1
				var inspFees = 1
				
				//Adding litter fees
				if (dumpTruck == "CHECKED")
				{
					feeSeqArray.push(addFeeWithExtraData("ILLEGAL 30", "ENF_ENVIRONMENTAL", "FINAL", equipTime, "N", capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
					aa.print("Successfully added dump truck fee for "+ equipTime+" hours.")
					aa.print("<br>")
				}
				if (lightningLoader == "CHECKED")
				{
					feeSeqArray.push(addFeeWithExtraData("ILLEGAL 50", "ENF_ENVIRONMENTAL", "FINAL", equipTime, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
					aa.print("Successfully added lightning loader fee for "+ equipTime+" hours.")
					aa.print("<br>")
				}
				if (pickupTruck == "CHECKED")
				{
					feeSeqArray.push(addFeeWithExtraData("ILLEGAL 70", "ENF_ENVIRONMENTAL", "FINAL", equipTime, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
					aa.print("Successfully added pickup truck fee for "+ equipTime+" hours.")
					aa.print("<br>")
				}
				if (rollTruck == "CHECKED")
				{
					feeSeqArray.push(addFeeWithExtraData("ILLEGAL 80", "ENF_ENVIRONMENTAL", "FINAL", equipTime, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
					aa.print("Successfully added roll truck fee for "+ equipTime+" hours.")
					aa.print("<br>")
				}
				if (numTires > 0)
				{
					feeSeqArray.push(addFeeWithExtraData("ILLEGAL 85", "ENF_ENVIRONMENTAL", "FINAL", numTires, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
					aa.print("Successfully added tire fee for "+ numTires+" tires.")
					aa.print("<br>")
				}
				if (dumpLoad > 0)
				{
					feeSeqArray.push(addFeeWithExtraData("ILLEGAL 90", "ENF_ENVIRONMENTAL", "FINAL", dumpLoad, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
					aa.print("Successfully added dump load fee for "+ dumpLoad+" load(s).")
					aa.print("<br>")
				}
				if (dumpFees > 0)
				{
					feeSeqArray.push(addFeeWithExtraData("ILLEGAL 95", "ENF_ENVIRONMENTAL", "FINAL", dumpFees, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
					aa.print("Successfully added dump fee for "+ dumpFees+" ton(s).")
					aa.print("<br>")
				}
				
				//Always add admin, labor, and inspection fees
				feeSeqArray.push(addFeeWithExtraData("ILLEGAL 110", "ENF_ENVIRONMENTAL", "FINAL", adminCost, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
				aa.print("Successfully added admin cost.")
				aa.print("<br>")
				feeSeqArray.push(addFeeWithExtraData("ILLEGAL 20", "ENF_ENVIRONMENTAL", "FINAL", laborCharge, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
				aa.print("Successfully added labor charge. This is "+numCrew+" crew member(s) for "+time+" hours.")
				aa.print("<br>")
				feeSeqArray.push(addFeeWithExtraData("ILLEGAL 100", "ENF_ENVIRONMENTAL", "FINAL", inspFees, "N",capObject[x],"Fee assessed and invoiced via batch invoice script.",null,null))
				aa.print("Successfully added inspection fee cost.")
				aa.print("<br>")
				
	
				aa.print("<br>");
				var paymentPeriodArray = [];
				
				//Building a fee array to invoice all fees on the same invoice number
				for (var i=0; i < feeSeqArray.length;i++)
				{
					paymentPeriodArray.push("FINAL");
				
					if (feeSeqArray[i] == null)
					{
					aa.print("I am null. I am not an object");
					aa.print("<br>");
					}
				}
				
				// Invoicing all litter fees on the same invoice number
				var invoiceOutcome = aa.finance.createInvoice(capObject[x],feeSeqArray,paymentPeriodArray);
				
				if(invoiceOutcome.getSuccess() )
				{
					var invoiceObjects = invoiceOutcome.getOutput();
					invoiceCount +=1;
				}
				else
				{
					aa.print("Error with invoiceOutcome.getSuccess()");
				}
				
			}
			
			// Checking that all fees were invoiced on the same invoice number
			var testInvoice = aa.finance.getInvoiceByCapID(capObject[x],null).getOutput()
			// Using [0] because the invoice that was just added should be the first invoice on a record going through this process
			var invNumber = testInvoice[0].invNbr;
			
			// Grass and Litter have different logging actions
			if (checker == 1)
			{
				aa.print("1 grass ticket was added to this record under invoice number "+invNumber)
			}
			else if(checker==0 && capArray[x].getCapType() != "Enforcement/Violations/Environmental/Grass and Weeds")
			{
				var testObject = aa.finance.getFeeItemInvoiceByInvoiceNbr(capObject[x],invNumber,null).getOutput()
				
				// Printing out all invoice information for logs
				aa.print(feeSeqArray.length +" fee(s) were added to this record under invoice number "+invNumber)
				aa.print("<br>");
				
				for (yy in testObject)
				{
					aa.print("<br>");
					aa.print(testObject[yy].getFeeDescription() + " was billed for $" + testObject[yy].fee+" under invoice number " + testObject[yy].invoiceNbr);
				}
			}
			
			// Adds email information to rolling email string for both record types
			var propAddress = aa.address.getAddressByCapId(capObject[x]).getOutput()
			
			if(checker == 1 || (checker == 0 && capArray[x].getCapType() != "Enforcement/Violations/Environmental/Grass and Weeds"))
			{
				emailRecords += "<br>"+capObject[x].getCustomID()+"  :  "+ propAddress[0]+"  :  Inv. # " +invNumber + "<br>";
			}
			
			//Updates record to Billed
			var dispositionDate = aa.date.getCurrentDate()
			var systemUserObj = aa.people.getSysUserByID("ADMIN").getOutput()
			
			aa.workflow.handleDisposition(capObject[x],stepNumber,wfEnd,dispositionDate,null,"Updated via batch invoice script",systemUserObj,"U");		
		}
	}
}
else
{
	aa.print("Error with capResult.getSuccess()")
}

//Check to see if there were actually items that were invoiced
if(invoiceCount == 0)
{
	emailText = "The batch invoicing job has completed, but there were no records to invoice." + "<br><br>"+ "Please check that this is correct by verifying that there are no litter or vegetation records that are in the Case Closed task with a task status of Open for Collections."
}
else
{
	emailText += invoiceCount + " records were invoiced:"+emailRecords
}

aa.sendMail(fromEmail, toEmail, ccEmail, emailSubject, emailText);
aa.print("<br>")
aa.print(invoiceCount+" total records were invoiced")
aa.print("<br><br>")
aa.print("Email sent to "+toEmail)

/*
Extra functions needed to debug or call other Accela scripts
*/

function feeExistsCap(feestr,capId) // optional statuses to check for
{
	var checkStatus = false;
	var statusArray = new Array();

	//get optional arguments
	if (arguments.length > 2) 
	{
		checkStatus = true;
		
		for (var i = 2; i < arguments.length; i++)
		{
			statusArray.push(arguments[i]);
		}
	}

	var feeResult = aa.fee.getFeeItems(capId, feestr, null);
	if (feeResult.getSuccess()) {
		var feeObjArr = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
		return false
	}

	for (ff in feeObjArr)
	{	
		if (feestr.equals(feeObjArr[ff].getFeeCod()) && (!checkStatus || exists(feeObjArr[ff].getFeeitemStatus(), statusArray)))
		{
			return true;
		}
	}
	
	return false;
}

function getScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

function debugObject(object)
{
var output = ''; 
 for (property in object) { 
   output += "<font color=red>" + property + "</font>" + ': ' + "<br><bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
 } 
 aa.print(output);
}