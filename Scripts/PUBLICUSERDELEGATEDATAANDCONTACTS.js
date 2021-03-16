/** * <pre> *  *  Accela Automation *  File: getDelegateDataAndContacts.js *  *  Accela, Inc. *  Copyright (C): 2014 *  *  Description: *  TODO * *  July 1, 2014		andy.zhong		Initial. *   * </pre> */var acceptFlag = "A";var proxyUsers = aa.publicUser.getDelegateUserByUserSeqNbr(getPublicUserSeqNbr());var initialUsers = aa.publicUser.getInitialUserByUserSeqNbr(getPublicUserSeqNbr());if(proxyUsers.getSuccess() && proxyUsers.getOutput() != null){	printProxyUsers(proxyUsers.getOutput());}if(initialUsers.getSuccess() && initialUsers.getOutput() != null){	printInitialUsers(initialUsers.getOutput());}function printInitialUsers(initialUsersList){	for(var i = 0; i < initialUsersList.size(); i++)	{		aa.log("******************************************* Print Public User Initial Users Contact Information *******************************************");		var publicUser = initialUsersList.get(i);		aa.log("------------Initial User ID :--------------"+publicUser.getUserID());		aa.log("------------Initial User Email :--------------"+publicUser.getEmail());		var initialInfo  = publicUser.getProxyUserModel();		if(initialInfo != null && acceptFlag.equals(initialInfo.getProxyStatus()))		{			aa.log("------------User Sequence Number :--------------"+initialInfo.getUserSeqNbr());			aa.log("------------Proxy User Sequence Number :--------------"+initialInfo.getProxyUserSeqNbr());			aa.log("------------Proxy User Nick Name :--------------"+initialInfo.getNickName());			aa.log("------------Proxy User Invitation Message :--------------"+initialInfo.getInvitationMessage());			aa.log("------------Proxy Status :--------------"+initialInfo.getProxyStatus());			printPermission(initialInfo.getPermissions());			printAssociatedContact(initialInfo.getUserSeqNbr());		}	}}function printProxyUsers(proxyUsersList){	for(var i = 0; i < proxyUsersList.size(); i++)	{		aa.log("************************************ Print Public User Proxy Users Information ************************************"+"*");		var publicUser = proxyUsersList.get(i);		aa.log("------------Proxy User ID :--------------"+publicUser.getUserID());		aa.log("------------Proxy User Email :--------------"+publicUser.getEmail());		var proxyInfo  = publicUser.getProxyUserModel();		if(proxyInfo != null)		{			aa.log("------------User Sequence Number :--------------"+proxyInfo.getUserSeqNbr());			aa.log("------------Proxy User Sequence Number :--------------"+proxyInfo.getProxyUserSeqNbr());			aa.log("------------Proxy User Nick Name :--------------"+proxyInfo.getNickName());			aa.log("------------Proxy User Invitation Message :--------------"+proxyInfo.getInvitationMessage());			aa.log("------------Proxy Status :--------------"+proxyInfo.getProxyStatus());			printPermission(proxyInfo.getPermissions());			printAssociatedContact(proxyInfo.getUserSeqNbr());		}	}}function printPermission(permissionList){	if(permissionList != null && permissionList.size() > 0)	{		for(var i = 0 ; i < permissionList.size(); i++)		{			aa.log("********************* Print Permission Information ************************"+"*");			var permissionModel = permissionList.get(i);			aa.log("--------- Service Provider Code ------------"+permissionModel.getServiceProviderCode());			aa.log("--------- User Sequence Number ------------"+permissionModel.getUserSeqNbr());			aa.log("--------- Proxy User Number ------------"+permissionModel.getProxyUserSeqNbr());			aa.log("--------- Level Type ------------"+permissionModel.getLevelType());			aa.log("--------- Level Data ------------"+permissionModel.getLevelData());			aa.log("--------- Permission ------------"+permissionModel.getPermission());		}	}}function printAssociatedContact(userSeqNbr){	var peopleResult = aa.people.getUserAssociatedContact(userSeqNbr);	if(peopleResult.getSuccess() && peopleResult.getOutput().size() > 0)	{		for(var i = 0; i< peopleResult.getOutput().size(); i++)		{			aa.log("************************************ Print Public User Associated Contact Information *********************************"+"*");			var contractorPeople = peopleResult.getOutput().get(i);			aa.log("------------Contact Type :--------------"+contractorPeople.getContactType());			aa.log("------------First Name :--------------"+contractorPeople.getFirstName());			aa.log("------------Middle Name :--------------"+contractorPeople.getMiddleName());			aa.log("------------Last Name :--------------"+contractorPeople.getLastName());			aa.log("------------Full Name :--------------"+contractorPeople.getFullName());			aa.log("------------Business Name :--------------"+contractorPeople.getBusinessName());			aa.log("------------Birth Date :--------------"+contractorPeople.getBirthDate());			aa.log("------------Business Name2 :--------------"+contractorPeople.getBusinessName2());			aa.log("------------BirthCity :--------------"+contractorPeople.getBirthCity());			aa.log("------------BirthState :--------------"+contractorPeople.getBirthState());			aa.log("------------BirthRegion :--------------"+contractorPeople.getBirthRegion());			aa.log("------------Phone1 :--------------"+contractorPeople.getPhone1());			aa.log("------------Phone2 :--------------"+contractorPeople.getPhone2());			aa.log("------------Fax :--------------"+contractorPeople.getFax());			aa.log("------------Email :--------------"+contractorPeople.getEmail());			aa.log("------------HoldCode :--------------"+contractorPeople.getHoldCode());			aa.log("------------HoldDescription :--------------"+contractorPeople.getHoldDescription());			aa.log("------------Fein :--------------"+contractorPeople.getFein());			aa.log("------------SSN :--------------"+contractorPeople.getSocialSecurityNumber());			aa.log("------------State :--------------"+contractorPeople.getAuditStatus());			aa.log("------------Country :--------------"+contractorPeople.getCountry());			aa.log("------------Salutation :--------------"+contractorPeople.getSalutation());			aa.log("------------Flag :--------------"+contractorPeople.getFlag());			aa.log("------------PreferredChannel :--------------"+contractorPeople.getPreferredChannel());			aa.log("------------ContactTypeFlag :--------------"+contractorPeople.getContactTypeFlag());			printContactAddress(contractorPeople.getServiceProviderCode(),contractorPeople.getContactSeqNumber());		}	}}function printContactAddress(servProvCode,contactSeqNbr){	var searchModel = aa.address.createContactAddressModel();	if(searchModel.getSuccess() && searchModel.getOutput() != null)	{		var contactAddress = searchModel.getOutput().getContactAddressModel();		contactAddress.getContactAddressPK().setServiceProviderCode(servProvCode);		contactAddress.setEntityType("CONTACT");		contactAddress.setEntityID(aa.util.parseLong(contactSeqNbr));		var contactAddressArray = aa.address.getContactAddressList(contactAddress);				if(contactAddressArray != null && contactAddressArray.getOutput().length > 0)		{			for(var i = 0; i< contactAddressArray.getOutput().length; i++)			{				aa.log("******************************** Print Contact Address Information ********************************"+"*");				addressModel = contactAddressArray.getOutput()[i].getContactAddressModel();				aa.log("------------ Service Provider Code :--------------"+addressModel.getContactAddressPK().getServiceProviderCode());				aa.log("------------ Entity Type :--------------"+addressModel.getEntityType());				aa.log("------------ Address Type :--------------"+addressModel.getAddressType());				aa.log("------------ Recipient :--------------"+addressModel.getRecipient());				aa.log("------------ Full Address :--------------"+addressModel.getFullAddress());				aa.log("------------ AddressLine1 :--------------"+addressModel.getAddressLine1());				aa.log("------------ AddressLine2 :--------------"+addressModel.getAddressLine2());				aa.log("------------ AddressLine3 :--------------"+addressModel.getAddressLine3());				aa.log("------------ HouseNumber Start :--------------"+addressModel.getHouseNumberStart());				aa.log("------------ getHouseNumber End :--------------"+addressModel.getHouseNumberEnd());				aa.log("------------ Street Direction :--------------"+addressModel.getStreetDirection());				aa.log("------------ Street Prefix :--------------"+addressModel.getStreetPrefix());				aa.log("------------ Street Name :--------------"+addressModel.getStreetName());				aa.log("------------ Street Suffix :--------------"+addressModel.getStreetSuffix());				aa.log("------------ UnitType :--------------"+addressModel.getUnitType());				aa.log("------------ UnitStart :--------------"+addressModel.getUnitStart());				aa.log("------------ UnitEnd :--------------"+addressModel.getUnitEnd());				aa.log("------------ Street Suffix Direction :--------------"+addressModel.getStreetSuffixDirection());				aa.log("------------ Country Code :--------------"+addressModel.getCountryCode());				aa.log("------------ City :--------------"+addressModel.getCity());				aa.log("------------ State :--------------"+addressModel.getState());				aa.log("------------ Zip :--------------"+addressModel.getZip());				aa.log("------------ Phone :--------------"+addressModel.getPhone());				aa.log("------------ Fax :--------------"+addressModel.getFax());				aa.log("------------ Fax Country Code :--------------"+addressModel.getFaxCountryCode());				aa.log("------------ HouseNumber AlphaEnd :--------------"+addressModel.getHouseNumberAlphaEnd());				aa.log("------------ Level Prefix :--------------"+addressModel.getLevelPrefix());			}		}			}}function getPublicUserSeqNbr(){	var callID = aa.env.getValue("CurrentUserID");	if (callID.startsWith("PUBLICUSER"))	{		var seqNbr = aa.util.parseLong(callID.split("PUBLICUSER")[1]);				return seqNbr;	}}aa.env.setValue("ScriptReturnCode","0");aa.env.setValue("ScriptReturnMessage", "========== Print Public User Delegated Data And Contacts Info Completed ! ===========");