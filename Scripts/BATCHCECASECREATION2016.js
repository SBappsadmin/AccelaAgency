/*
	Call the Master Scripts
*/
var SCRIPT_VERSION = 2.0
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM"));

/*
	CE parcel list received from Code Enforcement in April 2016
	I couldn't do all parcels at once because Accela timed out, so I broke them
	apart into chunks of 200
*/
var CEParcelList1_200 = ["71-08-03-434-030.000-026",
	"71-08-10-326-020.000-026",
	"71-03-34-457-001.000-026",
	"71-08-03-434-029.000-026",
	"71-08-02-312-010.000-026",
	"71-08-02-357-004.000-026",
	"71-08-02-380-007.000-026",
	"71-08-02-357-038.000-026",
	"71-08-03-438-005.000-026",
	"71-08-03-179-012.000-026",
	"71-08-03-261-003.000-026",
	"71-08-03-476-009.000-026",
	"71-08-03-483-004.000-026",
	"71-08-10-153-018.000-026",
	"71-08-01-327-046.000-026",
	"71-08-14-410-021.000-026",
	"71-08-03-257-021.000-026",
	"71-08-02-352-026.000-026",
	"71-08-03-227-009.000-026",
	"71-08-03-461-018.000-026",
	"71-08-14-476-022.000-026",
	"71-08-03-260-007.000-026",
	"71-09-08-279-024.000-026",
	"71-08-03-486-003.000-026",
	"71-03-34-378-020.000-026",
	"71-08-03-253-024.000-026",
	"71-08-12-333-012.000-026",
	"71-08-02-484-003.000-026",
	"71-08-02-356-006.000-026",
	"71-08-09-453-015.000-026",
	"71-03-35-359-002.000-026",
	"71-08-13-334-008.000-026",
	"71-03-33-329-032.000-026",
	"71-08-03-229-017.000-026",
	"71-08-03-283-002.000-026",
	"71-08-03-285-008.000-026",
	"71-08-02-332-032.000-026",
	"71-08-02-408-001.000-026",
	"71-08-22-128-017.000-026",
	"71-08-14-155-008.000-026",
	"71-08-02-155-003.000-026",
	"71-09-06-354-002.000-026",
	"71-08-10-476-010.000-026",
	"71-08-09-203-007.000-026",
	"71-08-12-328-011.000-026",
	"71-08-03-127-013.000-026",
	"71-03-34-402-015.000-026",
	"71-08-02-379-012.000-026",
	"71-08-03-434-003.000-026",
	"71-08-11-354-016.000-026",
	"71-08-15-439-001.000-026",
	"71-08-03-258-032.000-026",
	"71-08-02-154-021.000-026",
	"71-08-02-376-001.000-026",
	"71-03-35-377-030.000-026",
	"71-08-22-130-007.000-026",
	"71-08-03-481-006.000-026",
	"71-08-02-384-004.000-026",
	"71-03-35-378-001.000-026",
	"71-08-04-129-017.000-026",
	"71-08-02-476-009.000-026",
	"71-08-02-187-014.000-026",
	"71-08-02-357-018.000-026",
	"71-08-02-379-011.000-026",
	"71-03-34-476-028.000-026",
	"71-08-03-409-001.000-026",
	"71-08-09-409-015.000-026",
	"71-08-03-229-024.000-026",
	"71-08-12-409-014.000-026",
	"71-08-03-486-014.000-026",
	"71-09-06-355-008.000-026",
	"71-03-35-406-003.000-026",
	"71-09-05-402-017.000-026",
	"71-08-11-176-047.000-026",
	"71-08-03-434-035.000-026",
	"71-08-10-478-001.000-026",
	"71-08-11-254-018.000-026",
	"71-09-05-452-002.000-026",
	"71-08-10-180-008.000-026",
	"71-08-02-159-010.000-026",
	"71-09-06-357-011.000-026",
	"71-08-10-407-022.000-026",
	"71-08-11-376-025.000-026",
	"71-08-10-227-007.000-026",
	"71-08-09-282-021.000-026",
	"71-08-03-285-002.000-026",
	"71-08-02-331-038.000-026",
	"71-03-35-353-003.000-026",
	"71-08-14-427-011.000-026",
	"71-08-02-159-011.000-026",
	"71-08-03-281-003.000-026",
	"71-08-02-357-030.000-026",
	"71-08-09-276-027.000-026",
	"71-08-11-283-003.000-026",
	"71-08-02-261-008.000-026",
	"71-08-02-486-007.000-026",
	"71-08-12-455-001.000-026",
	"71-08-03-181-004.000-026",
	"71-08-03-455-020.000-026",
	"71-08-02-303-009.000-026",
	"71-03-34-452-005.000-026",
	"71-08-10-483-005.000-026",
	"71-08-02-407-018.000-026",
	"71-08-14-304-002.000-026",
	"71-08-09-327-019.000-026",
	"71-08-02-185-007.000-026",
	"71-03-34-253-011.000-026",
	"71-08-02-330-015.000-026",
	"71-08-02-155-024.000-026",
	"71-08-13-305-045.000-026",
	"71-08-02-306-008.000-026",
	"71-03-35-329-025.000-026",
	"71-08-10-476-019.000-026",
	"71-08-13-334-018.000-026",
	"71-08-02-327-002.000-026",
	"71-08-03-405-002.000-026",
	"71-08-03-328-002.000-026",
	"71-03-35-377-008.000-026",
	"71-03-35-154-025.000-026",
	"71-08-03-258-001.000-026",
	"71-03-34-477-018.000-026",
	"71-08-12-409-019.000-026",
	"71-03-35-377-007.000-026",
	"71-09-30-330-005.000-002",
	"71-09-06-354-003.000-026",
	"71-08-02-261-026.000-026",
	"71-03-34-430-015.000-026",
	"71-08-13-385-004.000-026",
	"71-08-09-458-007.000-026",
	"71-08-02-455-004.000-026",
	"71-03-33-452-023.000-026",
	"71-08-13-404-014.000-026",
	"71-08-12-409-020.000-026",
	"71-08-01-479-024.000-026",
	"71-08-09-403-007.000-026",
	"71-08-13-384-004.000-026",
	"71-08-03-410-001.000-026",
	"71-08-03-106-006.000-026",
	"71-08-13-384-015.000-026",
	"71-08-09-427-015.000-026",
	"71-08-12-432-001.000-026",
	"71-08-14-404-009.000-026",
	"71-08-15-439-009.000-026",
	"71-08-12-407-006.000-026",
	"71-08-02-402-003.000-026",
	"71-08-10-211-003.000-026",
	"71-08-09-410-011.000-026",
	"71-08-14-315-003.000-026",
	"71-08-13-480-004.000-026",
	"71-09-18-334-011.000-026",
	"71-08-03-201-019.000-026",
	"71-08-03-258-035.000-026",
	"71-03-34-453-030.000-026",
	"71-03-35-328-017.000-026",
	"71-08-02-260-008.000-026",
	"71-03-34-332-019.000-026",
	"71-08-22-251-001.000-026",
	"71-08-11-179-022.000-026",
	"71-08-02-305-013.000-026",
	"71-08-09-407-027.000-026",
	"71-08-14-404-008.000-026",
	"71-08-14-355-016.000-026",
	"71-08-03-434-016.000-026",
	"71-08-11-135-036.000-026",
	"71-08-03-453-036.000-026",
	"71-08-02-377-005.000-026",
	"71-08-03-283-002.000-026",
	"71-03-35-327-008.000-026",
	"71-08-02-329-003.000-026",
	"71-08-03-458-003.000-026",
	"71-08-03-301-005.000-026",
	"71-08-14-405-009.000-026",
	"71-08-03-458-007.000-026",
	"71-08-09-128-030.000-026",
	"71-08-02-477-027.000-026",
	"71-08-02-379-040.000-026",
	"71-09-19-429-007.000-026",
	"71-08-03-276-010.000-026",
	"71-03-34-453-024.000-026",
	"71-08-09-128-020.000-026",
	"71-08-10-379-002.000-026",
	"71-08-02-476-044.000-026",
	"71-08-08-202-011.000-026",
	"71-08-09-277-017.000-026",
	"71-08-13-451-014.000-026",
	"71-08-13-428-010.000-026",
	"71-08-10-210-007.000-026",
	"71-08-03-407-008.000-026",
	"71-08-02-133-006.000-026",
	"71-08-02-434-010.000-026",
	"71-09-18-379-017.000-026",
	"71-08-10-328-004.000-026",
	"71-08-03-280-004.000-026",
	"71-03-34-408-021.000-026",
	"71-08-16-103-004.000-026",
	"71-08-24-184-007.000-026",
	"71-08-12-409-019.000-026",
	"71-03-35-355-023.000-026",
	"71-03-35-329-017.000-026",
	"71-08-03-129-018.000-026",
	"71-03-34-380-024.000-026"]
	var CEParcelList201_400 = ["71-08-09-409-027.000-026",
	"71-08-02-183-001.000-026",
	"71-08-03-256-011.000-026",
	"71-03-34-276-007.000-026",
	"71-08-03-129-019.000-026",
	"71-08-02-461-006.000-026",
	"71-08-02-302-003.000-026",
	"71-08-02-356-034.000-026",
	"71-08-09-455-003.000-026",
	"71-08-12-151-003.000-026",
	"71-08-13-334-023.000-026",
	"71-08-10-179-005.000-026",
	"71-08-02-354-020.000-026",
	"71-08-02-357-015.000-026",
	"71-08-16-105-033.000-026",
	"71-08-03-401-006.000-026",
	"71-08-03-479-024.000-026",
	"71-08-10-211-005.000-026",
	"71-08-10-151-024.000-026",
	"71-03-35-327-023.000-026",
	"71-03-35-378-012.000-026",
	"71-03-34-178-013.000-026",
	"71-08-10-483-023.000-026",
	"71-08-13-376-013.000-026",
	"71-08-12-331-001.000-026",
	"71-08-02-403-005.000-026",
	"71-08-13-329-002.000-026",
	"71-08-02-155-005.000-026",
	"71-08-02-358-001.000-026",
	"71-03-35-378-013.000-026",
	"71-08-12-111-012.000-026",
	"71-08-02-154-017.000-026",
	"71-08-03-227-030.000-026",
	"71-08-02-307-013.000-026",
	"71-08-10-308-026.000-026",
	"71-08-03-483-018.000-026",
	"71-08-02-403-001.000-026",
	"71-08-13-478-006.000-026",
	"71-08-03-480-002.000-026",
	"71-08-11-203-006.000-026",
	"71-08-02-308-001.000-026",
	"71-03-35-378-011.000-026",
	"71-08-11-178-008.000-026",
	"71-03-34-332-022.000-026",
	"71-08-02-304-003.000-026",
	"71-08-02-261-031.000-026",
	"71-08-13-380-006.000-026",
	"71-08-14-329-006.000-026",
	"71-08-02-406-012.000-026",
	"71-08-11-158-006.000-026",
	"71-08-10-301-008.000-026",
	"71-03-35-381-003.000-026",
	"71-03-34-228-010.000-026",
	"71-08-12-233-008.000-026",
	"71-08-10-402-013.000-026",
	"71-08-03-409-016.000-026",
	"71-08-11-180-008.000-026",
	"71-08-03-226-036.000-026",
	"71-08-13-403-020.000-026",
	"71-03-35-379-008.000-026",
	"71-03-35-379-007.000-026",
	"71-03-35-330-032.000-026",
	"71-08-13-451-039.000-026",
	"71-08-11-301-016.000-026",
	"71-08-03-254-021.000-026",
	"71-08-03-257-012.000-026",
	"71-08-03-254-006.000-026",
	"71-03-34-458-025.000-026",
	"71-08-02-186-013.000-026",
	"71-08-01-286-018.000-026",
	"71-08-11-361-024.000-026",
	"71-03-35-381-004.000-026",
	"71-08-01-256-013.000-026",
	"71-08-10-435-003.000-026",
	"71-03-34-404-022.000-026",
	"71-03-34-407-008.000-026",
	"71-08-10-127-005.000-026",
	"71-08-03-428-008.000-026",
	"71-08-36-101-007.000-002",
	"71-03-35-406-007.000-026",
	"71-08-02-178-013.000-026",
	"71-08-13-403-010.000-026",
	"71-08-10-403-004.000-026",
	"71-08-03-486-010.000-026",
	"71-03-34-476-017.000-026",
	"71-08-02-406-007.000-026",
	"71-08-03-409-015.000-026",
	"71-08-12-377-013.000-026",
	"71-08-03-452-020.000-026",
	"71-08-09-327-015.000-026",
	"71-08-12-307-013.000-026",
	"71-08-11-361-029.000-026",
	"71-08-02-407-020.000-026",
	"71-08-09-304-044.000-026",
	"71-08-01-426-034.000-026",
	"71-08-03-282-026.000-026",
	"71-09-18-133-007.000-026",
	"71-08-10-309-025.000-026",
	"71-09-08-353-006.000-026",
	"71-08-13-480-011.000-026",
	"71-09-05-279-001.000-026",
	"71-08-24-185-015.000-026",
	"71-08-02-131-008.000-026",
	"71-08-10-303-021.000-026",
	"71-03-35-326-012.000-026",
	"71-08-11-255-009.000-026",
	"71-08-02-378-021.000-026",
	"71-08-03-486-017.000-026",
	"71-08-03-411-013.000-026",
	"71-08-02-309-010.000-026",
	"71-09-06-330-009.000-026",
	"71-08-02-261-017.000-026",
	"71-03-34-229-009.000-026",
	"71-09-18-412-003.000-026",
	"71-08-24-103-019.000-026",
	"71-03-34-476-015.000-026",
	"71-08-03-204-023.000-026",
	"71-08-14-458-020.000-026",
	"71-08-13-254-001.000-026",
	"71-03-34-481-019.000-026",
	"71-08-13-430-005.000-026",
	"71-08-13-451-016.000-026",
	"71-08-03-408-028.000-026",
	"71-08-14-428-005.000-026",
	"71-08-01-426-002.000-026",
	"71-08-01-479-047.000-026",
	"71-08-03-329-008.000-026",
	"71-09-06-352-013.000-026",
	"71-08-02-476-019.000-026",
	"71-08-11-178-002.000-026",
	"71-08-02-133-020.000-026",
	"71-08-02-258-005.000-026",
	"71-08-03-476-003.000-026",
	"71-08-02-379-030.000-026",
	"71-08-03-484-003.000-026",
	"71-08-03-203-021.000-026",
	"71-08-14-310-010.000-026",
	"71-08-02-405-023.000-026",
	"71-08-09-457-001.000-026",
	"71-08-02-354-009.000-026",
	"71-03-35-103-030.000-026",
	"71-08-11-376-006.000-026",
	"71-08-02-151-023.000-026",
	"71-08-12-405-008.000-026",
	"71-08-02-382-010.000-026",
	"71-08-13-385-002.000-026",
	"71-09-17-206-018.000-026",
	"71-08-24-181-006.000-026",
	"71-08-13-402-006.000-026",
	"71-08-01-304-016.000-026",
	"71-08-14-454-016.000-026",
	"71-08-03-276-021.000-026",
	"71-08-11-228-020.000-026",
	"71-08-02-355-018.000-026",
	"71-08-13-383-011.000-026",
	"71-09-17-177-004.000-026",
	"71-09-08-482-018.000-026",
	"71-08-01-377-025.000-026",
	"71-09-08-404-013.000-026",
	"71-09-06-358-014.000-026",
	"71-08-03-411-001.000-026",
	"71-08-10-431-009.000-026",
	"71-08-24-229-020.000-026",
	"71-03-35-327-024.000-026",
	"71-08-09-456-012.000-026",
	"71-03-34-476-010.000-026",
	"71-08-03-285-007.000-026",
	"71-08-03-454-021.000-026",
	"71-08-11-158-004.000-026",
	"71-08-14-410-017.000-026",
	"71-08-02-311-005.000-026",
	"71-08-14-402-011.000-026",
	"71-08-13-380-010.000-026",
	"71-09-06-356-007.000-026",
	"71-08-10-379-006.000-026",
	"71-08-13-334-028.000-026",
	"71-08-13-381-012.000-026",
	"71-08-13-256-024.000-026",
	"71-08-11-177-020.000-026",
	"71-08-03-476-005.000-026",
	"71-03-35-359-006.000-026",
	"71-03-35-180-004.000-026",
	"71-08-02-332-024.000-026",
	"71-08-12-257-022.000-026",
	"71-03-34-206-013.000-026",
	"71-09-18-327-007.000-026",
	"71-08-03-407-011.000-026",
	"71-08-02-303-002.000-026",
	"71-08-01-478-003.000-026",
	"71-08-03-383-011.000-026",
	"71-09-18-352-005.000-026",
	"71-08-03-411-011.000-026",
	"71-08-12-409-018.000-026",
	"71-08-03-453-002.000-026",
	"71-08-13-251-022.000-026",
	"71-08-03-457-022.000-026",
	"71-08-02-379-034.000-026",
	"71-08-02-329-004.000-026",
	"71-08-01-253-019.000-026",
	"71-08-11-228-017.000-026"]
	var CEParcelList401_600 = ["71-08-02-358-006.000-026",
	"71-08-09-408-004.000-026",
	"71-08-11-180-018.000-026",
	"71-08-03-258-026.000-026",
	"71-08-03-483-010.000-026",
	"71-08-14-152-001.000-026",
	"71-08-02-376-055.000-026",
	"71-03-34-427-017.000-026",
	"71-08-02-278-005.000-026",
	"71-08-03-407-004.000-026",
	"71-08-11-354-017.000-026",
	"71-08-10-205-001.000-026",
	"71-08-02-326-007.000-026",
	"71-03-35-330-013.000-026",
	"71-08-10-428-002.000-026",
	"71-08-11-103-029.000-026",
	"71-08-09-277-026.000-026",
	"71-03-34-458-011.000-026",
	"71-08-14-404-008.000-026",
	"71-08-02-455-011.000-026",
	"71-08-24-208-009.000-026",
	"71-08-24-276-009.000-026",
	"71-08-02-258-009.000-026",
	"71-08-09-377-014.000-026",
	"71-08-02-358-023.000-026",
	"71-09-17-204-022.000-026",
	"71-08-11-153-021.000-026",
	"71-08-11-301-012.000-026",
	"71-08-09-204-031.000-026",
	"71-08-10-476-013.000-026",
	"71-03-35-330-011.000-026",
	"71-08-11-203-010.000-026",
	"71-08-02-378-010.000-026",
	"71-08-02-380-004.000-026",
	"71-08-02-377-003.000-026",
	"71-08-03-411-008.000-026",
	"71-08-09-404-006.000-026",
	"71-08-02-157-018.000-026",
	"71-08-02-461-004.000-026",
	"71-08-11-106-010.000-026",
	"71-08-11-255-022.000-026",
	"71-08-10-454-013.000-026",
	"71-09-18-380-005.000-026",
	"71-08-03-480-015.000-026",
	"71-08-09-403-007.000-026",
	"71-08-13-480-005.000-026",
	"71-09-18-432-021.000-026",
	"71-08-02-454-018.000-026",
	"71-08-13-427-022.000-026",
	"71-03-35-381-019.000-026",
	"71-03-35-405-030.000-026",
	"71-08-03-455-026.000-026",
	"71-08-10-433-005.000-026",
	"71-09-18-158-021.000-026",
	"71-08-09-226-007.000-026",
	"71-08-11-361-026.000-026",
	"71-08-03-252-018.000-026",
	"71-03-34-453-002.000-026",
	"71-08-14-331-006.000-026",
	"71-09-18-431-020.000-026",
	"71-09-08-483-017.000-026",
	"71-08-02-434-010.000-026",
	"71-08-13-252-004.000-026",
	"71-09-17-153-005.000-026",
	"71-08-02-307-018.000-026",
	"71-08-02-308-006.000-026",
	"71-09-18-352-005.000-026",
	"71-09-18-178-008.000-026",
	"71-08-10-483-004.000-026",
	"71-08-03-382-004.000-026",
	"71-08-12-233-008.000-026",
	"71-08-08-426-002.000-026",
	"71-08-10-480-024.000-026",
	"71-08-14-426-021.000-026",
	"71-08-09-255-022.000-026",
	"71-09-06-356-005.000-026",
	"71-08-10-434-016.000-026",
	"71-09-18-157-001.000-026",
	"71-08-03-131-009.000-026",
	"71-09-18-158-020.000-026",
	"71-03-35-307-019.000-026",
	"71-08-09-481-018.000-026",
	"71-08-03-452-006.000-026",
	"71-09-17-206-018.000-026",
	"71-08-11-153-028.000-026",
	"71-08-02-378-024.000-026",
	"71-08-10-158-020.000-026",
	"71-08-02-188-009.000-026",
	"71-09-19-254-008.000-026",
	"71-08-09-204-013.000-026",
	"71-09-06-354-007.000-026",
	"71-08-02-378-025.000-026",
	"71-09-30-177-005.000-002",
	"71-08-10-407-001.000-026",
	"71-08-03-204-036.000-026",
	"71-03-34-476-004.000-026",
	"71-03-34-457-016.000-026",
	"71-08-02-405-015.000-026",
	"71-08-13-478-017.000-026",
	"71-08-11-181-015.000-026",
	"71-08-15-479-016.000-026",
	"71-09-06-156-045.000-026",
	"71-08-11-126-015.000-026",
	"71-08-03-386-013.000-026",
	"71-09-18-301-002.000-026",
	"71-08-11-103-021.000-026",
	"71-08-02-253-010.000-026",
	"71-08-03-154-013.000-026",
	"71-08-16-104-014.000-026",
	"71-08-02-355-015.000-026",
	"71-08-02-380-014.000-026",
	"71-08-11-160-024.000-026",
	"71-08-11-253-026.000-026",
	"71-08-02-188-008.000-026",
	"71-08-02-358-021.000-026",
	"71-08-13-334-019.000-026",
	"71-08-03-151-002.000-026",
	"71-08-09-427-007.000-026",
	"71-08-02-151-006.000-026",
	"71-08-09-453-004.000-026",
	"71-08-13-251-013.000-026",
	"71-09-18-355-028.000-026",
	"71-08-10-155-024.000-026",
	"71-08-01-403-016.000-026",
	"71-08-11-376-028.000-026",
	"71-08-13-376-011.000-026",
	"71-03-35-360-016.000-026",
	"71-08-02-183-011.000-026",
	"71-09-18-336-015.000-026",
	"71-08-11-376-027.000-026",
	"71-08-10-353-006.000-026",
	"71-08-03-179-014.000-026",
	"71-08-03-179-013.000-026",
	"71-08-03-133-010.000-026",
	"71-08-03-133-003.000-026",
	"71-08-03-132-018.000-026",
	"71-08-03-128-017.000-026",
	"71-03-34-379-024.000-026",
	"71-03-34-379-021.000-026",
	"71-03-34-380-007.000-026",
	"71-03-34-380-005.000-026",
	"71-03-34-380-002.000-026",
	"71-03-34-378-007.000-026",
	"71-03-34-178-021.000-026",
	"71-03-34-178-020.000-026",
	"71-03-34-178-019.000-026",
	"71-03-35-154-020.000-026",
	"71-08-03-106-009.000-026",
	"71-08-03-256-006.000-026",
	"71-08-03-256-005.000-026",
	"71-08-03-252-013.000-026",
	"71-08-03-252-012.000-026",
	"71-08-03-251-019.000-026",
	"71-08-03-201-037.000-026",
	"71-08-03-202-009.000-026",
	"71-08-03-201-027.000-026",
	"71-03-34-455-015.000-026",
	"71-03-34-452-012.000-026",
	"71-03-34-452-011.000-026",
	"71-03-34-452-009.000-026",
	"71-03-34-452-007.000-026",
	"71-03-34-406-015.000-026",
	"71-08-03-257-003.000-026",
	"71-08-03-257-002.000-026",
	"71-08-03-256-009.000-026",
	"71-08-03-253-010.000-026",
	"71-08-03-252-022.000-026",
	"71-08-03-253-009.000-026",
	"71-08-03-253-007.000-026",
	"71-08-03-252-017.000-026",
	"71-08-03-253-003.000-026",
	"71-08-03-252-014.000-026",
	"71-08-03-202-046.000-026",
	"71-08-03-203-015.000-026",
	"71-08-03-203-012.000-026",
	"71-08-03-202-032.000-026",
	"71-08-03-202-031.000-026",
	"71-03-33-478-022.000-026",
	"71-03-33-477-028.000-026",
	"71-08-03-280-006.000-026",
	"71-08-03-258-025.000-026",
	"71-08-03-258-022.000-026",
	"71-08-03-280-002.000-026",
	"71-08-03-276-009.000-026",
	"71-08-03-276-008.000-026",
	"71-08-03-254-020.000-026",
	"71-08-03-254-019.000-026",
	"71-08-03-276-006.000-026",
	"71-08-03-276-004.000-026",
	"71-08-03-276-001.000-026",
	"71-03-34-454-022.000-026",
	"71-03-34-476-007.000-026",
	"71-03-34-476-001.000-026",
	"71-03-34-430-008.000-026",
	"71-03-34-404-027.000-026",
	"71-08-03-130-019.000-026",
	"71-08-03-132-014.000-026",
	"71-08-03-132-013.000-026",
	"71-08-03-132-012.000-026",
	"71-08-03-128-010.000-026"]
	var CEParcelList601_800 = ["71-08-03-128-005.000-026",
	"71-08-03-128-004.000-026",
	"71-08-03-127-011.000-026",
	"71-03-34-379-008.000-026",
	"71-03-34-377-006.000-026",
	"71-03-34-330-028.000-026",
	"71-03-34-330-027.000-026",
	"71-03-34-330-025.000-026",
	"71-03-34-330-024.000-026",
	"71-08-03-254-004.000-026",
	"71-08-03-203-050.000-026",
	"71-08-03-204-027.000-026",
	"71-08-03-203-049.000-026",
	"71-08-03-203-048.000-026",
	"71-08-03-203-044.000-026",
	"71-08-03-204-012.000-026",
	"71-08-03-204-010.000-026",
	"71-03-34-458-010.000-026",
	"71-09-17-107-018.000-026",
	"71-09-08-307-025.000-026",
	"71-09-17-153-007.000-026",
	"71-09-08-381-002.000-026",
	"71-09-08-376-026.000-026",
	"71-09-17-104-025.000-026",
	"71-09-17-231-017.000-026",
	"71-08-03-279-025.000-026",
	"71-08-03-279-001.000-026",
	"71-08-03-287-002.000-026",
	"71-08-03-278-026.000-026",
	"71-03-34-479-013.000-026",
	"71-08-03-286-011.000-026",
	"71-03-34-478-017.000-026",
	"71-03-34-482-020.000-026",
	"71-08-03-287-007.000-026",
	"71-08-02-183-009.000-026",
	"71-08-02-331-028.000-026",
	"71-08-02-182-014.000-026",
	"71-08-02-178-011.000-026",
	"71-08-02-177-023.000-026",
	"71-08-02-182-016.000-026",
	"71-08-02-183-006.000-026",
	"71-08-02-186-016.000-026",
	"71-08-02-332-014.000-026",
	"71-08-02-328-001.000-026",
	"71-08-02-332-017.000-026",
	"71-08-24-131-008.000-026",
	"71-08-12-405-012.000-026",
	"71-09-06-354-011.000-026",
	"71-03-35-405-013.000-026",
	"71-03-35-405-016.000-026",
	"71-03-35-405-015.000-026",
	"71-03-35-405-014.000-026",
	"71-03-35-328-002.000-026",
	"71-03-35-328-008.000-026",
	"71-03-34-457-014.000-026",
	"71-09-06-330-021.000-026",
	"71-08-02-186-009.000-026",
	"71-08-02-331-010.000-026",
	"71-08-02-331-007.000-026",
	"71-08-02-185-016.000-026",
	"71-08-02-330-032.000-026",
	"71-08-02-331-018.000-026",
	"71-08-02-330-020.000-026",
	"71-08-02-185-017.000-026",
	"71-08-02-330-034.000-026",
	"71-08-13-476-033.000-026",
	"71-09-18-155-007.000-026",
	"71-08-13-255-012.000-026",
	"71-08-13-253-006.000-026",
	"71-08-12-409-011.000-026",
	"71-08-12-409-012.000-026",
	"71-08-03-285-003.000-026",
	"71-08-03-280-016.000-026",
	"71-08-03-226-031.000-026",
	"71-03-34-476-023.000-026",
	"71-08-03-280-014.000-026",
	"71-08-03-227-028.000-026",
	"71-08-03-226-047.000-026",
	"71-03-34-476-016.000-026",
	"71-08-03-227-027.000-026",
	"71-03-34-427-006.000-026",
	"71-08-03-281-007.000-026",
	"71-03-35-327-007.000-026",
	"71-03-35-402-001.000-026",
	"71-03-35-326-015.000-026",
	"71-09-18-451-002.000-026",
	"71-09-18-377-011.000-026",
	"71-08-13-476-017.000-026",
	"71-08-09-201-027.000-026",
	"71-09-06-327-010.000-026",
	"71-09-06-354-016.000-026",
	"71-09-06-354-022.000-026",
	"71-08-01-479-044.000-026",
	"71-09-06-330-011.000-026",
	"71-08-09-205-005.000-026",
	"71-08-09-252-005.000-026",
	"71-08-10-152-001.000-026",
	"71-08-02-330-013.000-026",
	"71-08-02-185-004.000-026",
	"71-08-02-307-025.000-026",
	"71-08-02-330-002.000-026",
	"71-08-02-159-013.000-026",
	"71-08-02-330-016.000-026",
	"71-08-02-304-005.000-026",
	"71-08-02-185-009.000-026",
	"71-08-02-304-006.000-026",
	"71-08-02-330-005.000-026",
	"71-08-02-307-026.000-026",
	"71-08-02-330-011.000-026",
	"71-08-02-159-017.000-026",
	"71-08-03-228-023.000-026",
	"71-08-03-286-001.000-026",
	"71-08-03-227-046.000-026",
	"71-08-03-428-001.000-026",
	"71-08-03-282-004.000-026",
	"71-08-03-286-007.000-026",
	"71-08-03-281-024.000-026",
	"71-08-03-281-018.000-026",
	"71-08-03-278-013.000-026",
	"71-08-12-329-017.000-026",
	"71-08-12-329-015.000-026",
	"71-09-06-177-020.000-026",
	"71-08-13-428-011.000-026",
	"71-08-13-404-020.000-026",
	"71-08-13-451-015.000-026",
	"71-09-18-308-012.000-026",
	"71-08-13-427-024.000-026",
	"71-08-13-404-018.000-026",
	"71-09-18-335-001.000-026",
	"71-09-18-309-001.000-026",
	"71-08-13-404-019.000-026",
	"71-08-02-154-022.000-026",
	"71-08-02-159-009.000-026",
	"71-08-02-306-014.000-026",
	"71-09-18-355-019.000-026",
	"71-09-18-355-008.000-026",
	"71-08-13-405-007.000-026",
	"71-08-13-403-019.000-026",
	"71-08-13-402-024.000-026",
	"71-08-13-402-023.000-026",
	"71-09-18-307-013.000-026",
	"71-09-18-331-008.000-026",
	"71-08-13-402-020.000-026",
	"71-08-13-403-017.000-026",
	"71-08-13-427-007.000-026",
	"71-08-13-426-026.000-026",
	"71-08-13-426-027.000-026",
	"71-08-11-355-001.000-026",
	"71-08-24-252-005.000-026",
	"71-08-01-432-036.000-026",
	"71-08-01-432-035.000-026",
	"71-03-34-454-012.000-026",
	"71-03-34-454-009.000-026",
	"71-03-34-408-009.000-026",
	"71-03-34-407-021.000-026",
	"71-03-34-407-019.000-026",
	"71-03-34-408-006.000-026",
	"71-03-34-403-022.000-026",
	"71-08-03-255-002.000-026",
	"71-03-34-480-030.000-026",
	"71-08-12-333-015.000-026",
	"71-08-12-333-012.000-026",
	"71-08-13-256-004.000-026",
	"71-09-18-462-002.000-026",
	"71-08-03-255-001.000-026",
	"71-08-03-251-011.000-026",
	"71-08-03-201-022.000-026",
	"71-08-03-201-021.000-026",
	"71-08-03-201-020.000-026",
	"71-08-03-133-017.000-026",
	"71-08-03-201-013.000-026",
	"71-08-03-133-015.000-026",
	"71-08-03-129-022.000-026",
	"71-08-03-201-008.000-026",
	"71-08-13-258-011.000-026",
	"71-08-13-256-002.000-026",
	"71-08-13-256-001.000-026",
	"71-08-13-254-024.000-026",
	"71-08-13-254-027.000-026",
	"71-08-13-253-020.000-026",
	"71-08-11-327-001.000-026",
	"71-08-13-477-017.000-026",
	"71-08-13-428-018.000-026",
	"71-08-01-255-020.000-026",
	"71-08-01-255-021.000-026",
	"71-08-03-129-021.000-026",
	"71-03-34-380-023.000-026",
	"71-03-34-380-021.000-026",
	"71-03-34-378-030.000-026",
	"71-03-34-451-005.000-026",
	"71-03-34-451-003.000-026",
	"71-03-34-451-002.000-026",
	"71-03-34-332-025.000-026",
	"71-03-34-179-021.000-026",
	"71-08-09-253-009-000-026",
	"71-08-09-202-027.000-026",
	"71-08-09-202-026.000-026",
	"71-08-09-255-006.000-026",
	"71-08-09-255-013.000-026",
	"71-09-18-327-004.000-026"]
	var CEParcelList801_1000 = ["71-09-18-307-003.000-026",
	"71-08-13-403-007.000-026",
	"71-09-18-307-006.000-026",
	"71-08-13-426-005.000-026",
	"71-09-18-157-015.000-026",
	"71-08-13-402-006.000-026",
	"71-08-13-403-009.000-026",
	"71-09-18-158-013.000-026",
	"71-08-13-256-019.000-026",
	"71-08-13-256-017.000-026",
	"71-09-18-157-017.000-026",
	"71-03-34-251-011.000-026",
	"71-03-34-179-016.000-026",
	"71-08-24-209-018.000-026",
	"71-03-34-179-015.000-026",
	"71-03-34-179-014.000-026",
	"71-03-35-105-009.000-026",
	"71-03-34-480-025.000-026",
	"71-08-03-132-028.000-026",
	"71-08-03-132-015.000-026",
	"71-03-34-407-029.000-026",
	"71-03-34-378-001.000-026",
	"71-08-10-157-012.000-026",
	"71-08-10-328-002.000-026",
	"71-08-10-310-021.000-026",
	"71-08-09-256-015.000-026",
	"71-08-09-256-013.000-026",
	"71-03-35-383-003.000-026",
	"71-08-02-127-001.000-026",
	"71-03-35-378-025.000-026",
	"71-03-35-379-010.000-026",
	"71-03-35-383-001.000-026",
	"71-08-10-485-003.000-026",
	"71-08-02-484-008.000-026",
	"71-08-09-277-031.000-026",
	"71-08-11-226-010.000-026",
	"71-08-02-305-012.000-026",
	"71-08-02-158-005.000-026",
	"71-08-02-158-006.000-026",
	"71-08-02-302-009.000-026",
	"71-08-13-277-015.000-026",
	"71-08-13-277-016.000-026",
	"71-08-13-277-017.000-026",
	"71-08-13-277-018.000-026",
	"71-09-18-158-026.000-026",
	"71-09-18-180-002.000-026",
	"71-09-18-331-001.000-026",
	"71-09-18-307-015.000-026",
	"71-09-18-182-018.000-026",
	"71-09-18-334-006.000-026",
	"71-09-18-326-006.000-026",
	"71-09-18-307-018.000-026",
	"71-09-18-307-017.000-026",
	"71-08-12-405-007.000-026",
	"71-09-06-362-009.000-026",
	"71-08-13-402-021.000-026",
	"71-08-13-402-022.000-026",
	"71-08-13-403-015.000-026",
	"71-08-13-402-010.000-026",
	"71-08-13-403-016.000-026",
	"71-09-18-307-008.000-026",
	"71-03-35-377-023.000-026",
	"71-09-07-101-011.000-026",
	"71-08-10-177-015.000-026",
	"71-08-10-328-020.000-026",
	"71-08-12-307-004.000-026",
	"71-08-13-429-005.000-026",
	"71-08-13-428-019.000-026",
	"71-08-13-428-023.000-026",
	"71-08-13-428-026.000-026",
	"71-09-06-377-016.000-026",
	"71-09-06-378-004.000-026",
	"71-09-06-355-005.000-026",
	"71-08-01-326-001.000-026",
	"71-08-12-428-027.000-026",
	"71-08-01-205-002.000-026",
	"71-09-17-253-005.000-026",
	"71-03-35-380-029.000-026",
	"71-03-35-380-020.000-026",
	"71-03-35-380-019.000-026",
	"71-03-35-380-022.000-026",
	"71-03-35-380-018.000-026",
	"71-03-35-380-021.000-026",
	"71-09-18-336-009.000-026",
	"71-03-35-182-001.000-026",
	"71-09-18-403-010.000-026",
	"71-09-18-410-004.000-026",
	"71-03-35-329-012.000-026",
	"71-03-35-405-020.000-026",
	"71-03-35-405-022.000-026",
	"71-03-35-405-019.000-026",
	"71-03-35-406-014.000-026",
	"71-03-35-329-028.000-026",
	"71-08-13-257-014.000-026",
	"71-08-13-257-015.000-026",
	"71-08-09-180-005.000-026",
	"71-03-35-327-034.000-026",
	"71-08-02-332-032.000-026",
	"71-08-02-333-009.000-026",
	"71-09-06-306-025.000-026",
	"71-08-01-478-009.000-026",
	"71-08-01-431-038.000-026",
	"71-08-12-331-001.000-026",
	"71-08-12-328-011.000-026",
	"71-08-01-407-006.000-026",
	"71-09-06-176-011.000-026",
	"71-08-01-454-006.000-026",
	"71-08-12-331-007.000-026",
	"71-08-12-209-013.000-026",
	"71-08-01-187-006.000-026",
	"71-08-01-403-019.000-026",
	"71-08-02-326-017.000-026",
	"71-08-02-326-012.000-026",
	"71-08-02-326-011.000-026",
	"71-08-02-330-001.000-026",
	"71-08-13-280-004.000-026",
	"71-08-13-280-006.000-026",
	"71-08-13-280-005.000-026",
	"71-08-09-329-002.000-026",
	"71-08-10-176-017.000-026",
	"71-08-08-426-002.000-026",
	"71-08-08-254-001.000-026",
	"71-08-09-403-019.000-026",
	"71-08-02-126-003.000-026",
	"71-08-10-151-027.000-026",
	"71-08-10-360-012.000-026",
	"71-08-03-152-014.000-026",
	"71-08-03-227-022.000-026",
	"71-08-10-209-005-000-026",
	"71-08-02-155-026.000-026",
	"71-08-09-252-016.000-026",
	"71-08-02-426-003.000-026",
	"71-08-10-403-005.000-026",
	"71-09-18-383-009.000-026",
	"71-03-35-405-031.000-026",
	"71-08-10-379-001.000-026",
	"71-09-18-354-015.000-026",
	"71-08-13-451-013.000-026",
	"71-09-18-332-015.000-026",
	"71-08-03-428-001.000-026",
	"71-09-18-376-018.000-026",
	"71-08-02-187-001.000-026",
	"71-08-13-405-009.000-026",
	"71-03-34-457-016.000-026",
	"71-08-12-151-003.000-026",
	"71-08-02-331-023.000-026",
	"71-08-13-326-001.000-026",
	"71-08-03-201-038.000-026",
	"71-08-02-154-013.000-026",
	"71-08-03-251-021.000-026",
	"71-03-34-457-014.000-026",
	"71-08-02-477-012.000-026",
	"71-08-02-154-013.000-026",
	"71-09-18-378-003.000-026",
	"71-08-03-103-007.000-026",
	"71-03-34-206-024.000-026",
	"71-08-02-357-005.000-026",
	"71-08-13-385-025.000-026",
	"71-08-02-354-014.008-026",
	"71-08-11-352-018.000-026"]

var CECount = 0;

/*
	Main logic start
*/
for (x in CEParcelList1_200)
{
	var parcelObj = aa.parcel.getParceListForAdmin(CEParcelList1_200[x],null,null,null,null,null,null,null,null,null)
	
	if(parcelObj.getSuccess())
	{
		var parcel = parcelObj.getOutput()
		for(y in parcel)
		{
			var pMod = parcel[y].getParcelModel()
			var pKey = pMod.getParcelNumber()
			//aa.print(pKey)
			var pcCond = aa.parcelCondition.getParcelConditions(pKey)
			//aa.print(pcCond.getSuccess())
			
			if(pcCond.getSuccess())
			{
				CECount += 1
				var newCECap = createCap("Enforcement/Violations/Environmental/Continuous Enforcement", "Continuous Enforcement")
				createCapComment("CE record created in batch for start of cutting season.",newCECap)
				
				// Copy parcel to the new record
				var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
				newCapParcel.setParcelModel(pMod);
				newCapParcel.setCapIDModel(newCECap);
				newCapParcel.setL1ParcelNo(pKey);
				newCapParcel.setParcelNo(pKey);
				aa.parcel.createCapParcel(newCapParcel);
				
				//Copy address to the new record
				var addrObj = aa.address.getAddressListForAdmin(pKey,null,null,null,null,null,null,null,null,null,null,null,null,null)
				if (addrObj.getSuccess())
				{
					var addrs = addrObj.getOutput();
					
					for(addr in addrs)
					{
						var newAddress = addrs[addr].getRefAddressModel().toAddressModel()
						//var refAddrId = newAddress.getRefAddressId()
						newAddress.setCapID(newCECap);
						aa.address.createAddressWithAPOAttribute(newCECap,newAddress);
					}
				}
				
				// Copy owner to the new record
				var parScriptMod = aa.parcel.getParcelDailyByCapID(newCECap,null)
				var parScripts = parScriptMod.getOutput()
				for(par in parScripts)
				{
					var ownObj = aa.owner.getOwnersByParcel(parScripts[par])
					
					if (ownObj.getSuccess())
					{
						var owners = ownObj.getOutput()
						for (owner in owners)
						{
							owners[owner].setCapID(newCECap)
							aa.owner.createCapOwnerWithAPOAttribute(owners[owner])
						}
					}
				}
				closeTaskCap("Case Intake", "Assigned", "Updated via batchCECaseCreation script.", null, null, newCECap)
				scheduleInspectionCap("Abatement", 1, "PARKSCREW", null, "Scheduled via batchCECaseCreation.",newCECap)
				
			}
			else
			{
				aa.print(pKey + " didn't have a CE condition. Please create manually.")
			}

		}
	}
}
aa.print("CECount: "+CECount)

function getScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}	