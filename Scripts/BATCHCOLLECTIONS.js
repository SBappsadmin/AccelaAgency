/*
	Global constants for adding fees to Litter and Vegetation records
*/
var wfTask = "Case Closed"
var wfStatus = "Billed"
var wfEnd = "Review Case for Collections"
var capResult = aa.cap.getCaps("Violations",wfTask,wfStatus,null)
var unpaidInvObjArray = new Array()
var oldInvObjArray = new Array()
var todayDate = new Date()
var dontWant = new Array(null, "", " ")
// Currently no email, but I set up these variables just in case
var fromEmail = "noreply@accela.com"
var toEmail = "DL-CodeEnforcementManagers@southbendin.gov"
var emailSubject = "Accela past due invoices"
var ccEmail = ""

/*
	Call the Master Scripts
*/
var SCRIPT_VERSION = 2.0
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"))
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"))
eval(getScriptText("INCLUDES_CUSTOM"))

if (systemUserObj == null){
	systemUserObj = aa.people.getSysUserByID("ADMIN").getOutput()
}

/*
	Object declaration
*/
function invObject(invModelObj,jsInvDate,invDateUSA){
	this.invModelObj = invModelObj
	this.jsInvDate = jsInvDate
	this.invDateUSA = invDateUSA

	this.addCapID = function(capIDInput){
		this.capID = capIDInput
	}

	this.addParcel = function(parcel){
		this.parcel = parcel
	}
	this.addPayment = function(payment){
		this.payment = payment;
	}
	this.addOwner1 = function(owner){
		this.owner1 = owner
	}
	this.addOwner2 = function(owner){
		this.owner2 = owner
	}
	this.addOwnerAddr1 = function(numStreet,city,state,zip){
		this.ownerAddr1NumStreet = numStreet;
		this.ownerAddr1City = city;
		this.ownerAddr1State = state;
		this.ownerAddr1Zip = zip;
	}
	this.addOwnerAddr2 = function(numStreet,city,state,zip){
		this.ownerAddr2NumStreet = numStreet;
		this.ownerAddr2City = city;
		this.ownerAddr2State = state;
		this.ownerAddr2Zip = zip;
	}
	this.addPropAddr = function(num,dir,street,city,state,zip){
		this.propAddrNum = num
		this.propDir = dir
		this.propStreet = street
		this.propAddrCity = city
		this.propAddrState = state
		this.propAddrZip = zip
		this.propAddr = num + dir + street

		var addrConcat = new Array(num,dir,street)

		if(num != "" && dir != "" && street != ""){
			this.propAddr = addrConcat.join(" ")
		}
		else{
			var returnAddr = new Array()

			for(i=0;i<3;i++){
				if(addrConcat[i] != ""){
					returnAddr.push(addrConcat[i])
				}
			}
			this.propAddr = returnAddr.join(" ")
		}
	}
	this.addInvDept = function(dept){
		this.dept = dept
	}
	this.addDesc = function(desc){
		this.desc = desc
	}
	this.addOrd = function(ord){
		this.ord = ord
	}
}


/*
	Main logic start
*/
if (capResult.getSuccess()){
	var capArray = capResult.getOutput();

	for(x in capArray){
		if (capArray[x].getCapType() != "Enforcement/Violations/Environmental/Continuous Enforcement"){
			// Assign a friendly variable name to avoid typing .getCapID() multiple times
			var capObject = capArray[x].getCapID();
			var invoiceResult = aa.finance.getInvoiceByCapID(capObject,null);
			var paymentResult = aa.finance.getPaymentByCapID(capObject,null);
			var ownResult = aa.owner.getOwnerByCapId(capObject);
			var addrResult = aa.address.getAddressByCapId(capObject);
			var parcelResult = aa.parcel.getParcelDailyByCapID(capObject,null);
			var updateStatus = false;
			var oldRecord = false;
			// Statement to see if cap has invoice and if that invoice is in the unpaidInvoices result
			if(invoiceResult.getSuccess()){
				invoiceArray = invoiceResult.getOutput()

				for(y in invoiceArray){
					// Note that this appears to be looking at the invoice penalty Date
					// and not the invoice due date
					var invModel = invoiceArray[y].getInvoiceModel();
					var invDateSplit = invModel.getInvDate().toString().split(" ");
					var invDateList = invDateSplit[0].split("-")
					var invDateUSA = invDateList[1]+"-"+invDateList[2]+"-"+invDateList[0]
                    var invDate = new Date(invDateList[0], invDateList[1] - 1, invDateList[2])
                    // Still leaving this in after the initial batch collections run on 2017-11-02 because it was a Code Enforcement requirement
                    var MayDate = new Date(2017,4,1)

					// This is the same check that the function .getUnpaidInvoices() does, according to Lu Fisher at Accela
                    // Right now going for 45 days
					if ((invModel.getBalanceDue() != 0) && (invModel.getAuditStatus() == "A")){
						if ((Math.ceil((todayDate-invDate)/(1000*3600*24))>= 45) && (invDate >= MayDate)){
							updateStatus = true
							var collObj = new invObject(invModel,invDate,invDateUSA)

							collObj.addCapID(capObject.getCustomID())

							// Adds parcel information
							if(parcelResult.getSuccess()){
								parcelArray = parcelResult.getOutput();

								for (parcel in parcelArray){
									if (parcelArray[parcel].getPrimaryParcelFlag() == "Y"){
										collObj.addParcel(parcelArray[parcel].getParcelNumber())
									}
								}
								if(collObj.parcel == undefined){
									collObj.addParcel("")
								}
							}
							else{
								aa.print("Something went wrong with aa.parcel.getParcelByCapId().getSuccess()")
							}
							var feeResult = aa.finance.getFeeItemInvoiceByInvoiceNbr(capObject,invoiceArray[y].getInvNbr(),null);

							// Statements to see if an invoice is OVB
							if(feeResult.getSuccess()){
								feeArray = feeResult.getOutput();
								for (fee in feeArray){
									if((feeArray[fee].getFeeCode() == "GRASS 27" || feeArray[fee].getFeeCode() == "SNOW 1") &&
									Object.keys(feeArray).length == 1){
										collObj.addInvDept("OVB")

										if(feeArray[fee].getFeeCode() == "GRASS 27"){
											collObj.addDesc("Grass Citation")
											collObj.addOrd("19-35")
										}
										else if (feeArray[fee].getFeeCode() == "SNOW 1"){
											collObj.addDesc("Snow Citation")
											collObj.addOrd("18-7")
										}
									}
									// This is only here for the first few months becasue the invoices were comingled for the first
									// iteration of the invoicing process. This can be deleted after the invoices from 2015 are all processed
									// and dealt with
									else if((feeArray[fee].getFeeCode() == "GRASS 27" || feeArray[fee].getFeeCode() == "SNOW 1") &&
									Object.keys(feeArray).length != 1){
										collObj.addInvDept("OVB/Code")

										if(feeArray[fee].getFeeCode() == "GRASS 27"){
											collObj.addDesc("Grass Work & Citation")
											collObj.addOrd("19-35/16-59")
										}
										else if (feeArray[fee].getFeeCode() == "SNOW 1"){
											collObj.addDesc("Snow Work & Citation")
											collObj.addOrd("18-7")
										}
									}
									else{
										collObj.addInvDept("Code")

										if(String(feeArray[fee].getFeeCode()).substring(0,5) == "GRASS"){
											collObj.addDesc("Grass Work")
											collObj.addOrd("16-59")
										}
										else if (String(feeArray[fee].getFeeCode()).substring(0,7) == "ILLEGAL"){
											if (capArray[x].getCapType() == "Enforcement/Violations/Environmental/Vegetation"){
												collObj.addDesc("Veg Work")
												collObj.addOrd("16-53")
											}
											else{
												collObj.addDesc("Litter Work")
												collObj.addOrd("16-53")
											}
										}
										else{
											collObj.addDesc("Other Work")
											collObj.addOrd("Other")
										}
									}
								}
							}
							else{
								aa.print("Something went wrong with aa.finance.getFeeItemInvoiceByInvoiceNbr().getSuccess()")
							}

							// Statements to correctly build address information
							if(addrResult.getSuccess()){
								addrArray = addrResult.getOutput();
								if(Object.keys(addrArray).length == 0){
									collObj.addPropAddr("","","","","");
								}
								else{
									for(addr in addrArray){
										var propNum

										if(dontWant.indexOf(addrArray[addr].getHouseFractionStart()) == -1){
											propNum = addrArray[addr].getHouseNumberStart()+" "+addrArray[addr].getHouseFractionStart();
										}
										else if(dontWant.indexOf(addrArray[addr].getHouseNumberStart()) == -1){
											propNum = addrArray[addr].getHouseNumberStart();
										}
										else{
											propNum = ""
										}

										var street = ""
										var dir

										if(dontWant.indexOf(addrArray[addr].getStreetDirection()) == -1){
											dir = addrArray[addr].getStreetDirection();
										}
										else{
											dir = ""
										}


										if(dontWant.indexOf(addrArray[addr].getStreetPrefix()) == -1){
											street += addrArray[addr].getStreetPrefix()+" ";
										}

										street += addrArray[addr].getStreetName();

										if(dontWant.indexOf(addrArray[addr].getStreetSuffix()) == -1){
											street += " " + addrArray[addr].getStreetSuffix();
										}

										if(dontWant.indexOf(addrArray[addr].getStreetSuffixdirection()) == -1){
											street += " " + addrArray[addr].getStreetSuffixdirection();
										}

										var city;

										if(dontWant.indexOf(addrArray[addr].getCity()) == -1){
											city = addrArray[addr].getCity();
										}
										else{
											city = ""
										}

										var state;

										if(dontWant.indexOf(addrArray[addr].getState()) == -1){
											state = addrArray[addr].getState();
										}
										else{
											state = ""
										}

										var zip;

										if(dontWant.indexOf(addrArray[addr].getZip()) == -1){
											zip = addrArray[addr].getZip();
										}
										else{
											zip = ""
										}

										collObj.addPropAddr(propNum,dir,street,city,state,zip)
									}
								}
							}
							else{
								aa.print("Something went wrong with aa.address.getAddressByCapId().getSuccess()")
							}
							// Statements to see if payments currently exist on the RECORD, not just the invoice
							if(paymentResult.getSuccess()){
								var paymentArray = paymentResult.getOutput()
								collObj.addPayment(Object.keys(paymentArray).length)
							}
							else{
								aa.print("Something went wrong with aa.finance.getPaymentByCapID().getSuccess()")
							}

							// Statements to correctly grab owner name and address information
							if (ownResult.getSuccess()){
								var ownArray = aa.owner.getOwnerByCapId(capObject).getOutput();
								if(Object.keys(ownArray).length == 0){
									collObj.addOwner1("")
									collObj.addOwnerAddr1("","","","")
									collObj.addOwner2("")
									collObj.addOwnerAddr2("","","","")
								}
								else{
									collObj.addOwner1(ownArray[0].getOwnerFullName())
									collObj.addOwnerAddr1(ownArray[0].getMailAddress1(),ownArray[0].getMailCity(),
									ownArray[0].getMailState(),ownArray[0].getMailZip())
									collObj.addOwner2("")
									collObj.addOwnerAddr2("","","","")

									for(z in ownArray){
										if(String(ownArray[z].getOwnerFullName()) != String(ownArray[0].getOwnerFullName())){
											collObj.addOwner2(ownArray[z].getOwnerFullName())
										}
										if(String(ownArray[z].getMailAddress1()+","+ownArray[z].getMailCity()+
											","+ownArray[z].getMailState()+","+ownArray[z].getMailZip()) != String(ownArray[0].getMailAddress1()+","+ownArray[0].getMailCity()+
											","+ownArray[0].getMailState()+","+ownArray[0].getMailZip())){
											collObj.addOwnerAddr2(ownArray[z].getMailAddress1(),ownArray[z].getMailCity(),
											ownArray[z].getMailState(),ownArray[z].getMailZip())
										}

									}
								}
							}
							else{
								aa.print("Something went wrong with aa.owner.getOwnerByCapId().getSuccess()")
                            }

                            unpaidInvObjArray.push(collObj)
                            updateTask(wfTask, wfEnd, "Updated via batch collection script", null, "", capObject)
                        }
					}
				}
			}
			else{
				aa.print("Something went wrong with aa.finance.getInvoiceByCapID().getSuccess()")
			}
		}
	}
}
else{
	aa.print("The capResult returned an error.");
}

 var csvText = "Owner1|Owner2|Mail Address 1|Mail City 1|Mail State 1|Mail Zip 1|Mail Address 2|Mail City 2|Mail State 2|Mail Zip 2|Description|"+
"Ordinance Number|Location/Property Address|Location/Property Address City|Location/Property Address State|Location/Property Address Zip|"+
"Date of Penalty or Service|Balance Due|Citation Number|ParcelNbr|Number|RecordID|Dept|PaymentsOnRec|InvAmount|DaysOutstanding|Invoice Due Date"+"\n"

for (x in unpaidInvObjArray){
	csvText +=
	unpaidInvObjArray[x].owner1+"|"+
	unpaidInvObjArray[x].owner2+"|"+
	unpaidInvObjArray[x].ownerAddr1NumStreet+"|"+
	unpaidInvObjArray[x].ownerAddr1City+"|"+
	unpaidInvObjArray[x].ownerAddr1State+"|"+
	unpaidInvObjArray[x].ownerAddr1Zip+"|"+
	unpaidInvObjArray[x].ownerAddr2NumStreet+"|"+
	unpaidInvObjArray[x].ownerAddr2City+"|"+
	unpaidInvObjArray[x].ownerAddr2State+"|"+
	unpaidInvObjArray[x].ownerAddr2Zip +"|"+
	unpaidInvObjArray[x].desc +"|"+
	unpaidInvObjArray[x].ord +"|"+
	unpaidInvObjArray[x].propAddr+"|"+
	unpaidInvObjArray[x].propAddrCity+"|"+
	unpaidInvObjArray[x].propAddrState+"|"+
	unpaidInvObjArray[x].propAddrZip +"|"+
	unpaidInvObjArray[x].invDateUSA+"|"+
	unpaidInvObjArray[x].invModelObj.getBalanceDue()+"|"+
	unpaidInvObjArray[x].capID +" "+unpaidInvObjArray[x].invModelObj.getInvNbr()+"|"+
	unpaidInvObjArray[x].parcel+"|"+
	unpaidInvObjArray[x].invModelObj.getInvNbr()+"|"+
	unpaidInvObjArray[x].capID +"|"+
	unpaidInvObjArray[x].dept+"|"+
	unpaidInvObjArray[x].payment+"|"+
	unpaidInvObjArray[x].invModelObj.getInvAmount()+"|"+
	Math.ceil((todayDate-unpaidInvObjArray[x].jsInvDate)/(1000*3600*24))+"|"+
	unpaidInvObjArray[x].invModelObj.getInvDueDate()+"|"+"\n"
}

aa.print(csvText)

/*
Extra functions needed to debug or call other Accela scripts
*/

function getScriptText(vScriptName){
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}
