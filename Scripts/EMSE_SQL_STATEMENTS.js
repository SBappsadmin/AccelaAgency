-------------------------------------------------------------------------------------------------------------------------
var sql = "create table dbo.person("
 + "name varchar(50),"
 + "age int "
+ ")";

aa.util.update("custom", sql, null)
-------------------------------------------------------------------------------------------------------------------------

var parmArray = new Array();
parmArray[0] = "Thomas";
parmArray[1] = 18;
var sql = "Insert into dbo.person(name, age) values(?,?)";

aa.util.update("custom", sql, parmArray)
-------------------------------------------------------------------------------------------------------------------------
var sql = "Select name, age from dbo.person";

var selectResult = aa.util.select("custom", sql, null);

if(selectResult.getSuccess())
{
 var selectOutput = selectResult.getOutput();

 for(var i=0; i<selectOutput.size(); i++)
 {
   var eachRecord = selectOutput.get(i);
   aa.print(eachRecord.get(??name??));
   aa.print(eachRecord.get(??age??));
 }
}
else
{
 aa.print("Get records from custom db failed!")
}
-------------------------------------------------------------------------------------------------------------------------

var arrayList = aa.util.newArrayList();
var parmArray = new Array();
parmArray[0] = "Thoms";
parmArray[1] = 18;
var parmArray1 = new Array();
parmArray1[0] = "Li";
parmArray1[1] = 33;

arrayList.add((aa.util.toObjectArray(parmArray)).getOutput());
arrayList.add((aa.util.toObjectArray(parmArray1)).getOutput());

var sql = "Insert into dbo.person(name, person) values(?,?)";

aa.util.batchUpdate("custom", sql, arrayList)

