function ZFUNC_EMAIL()
{
var sid;
var index = 1;
var vals = [];
var data = [];
var emailoutput = "<br>";
var conn = $.db.getConnection();
var pstmt = conn.prepareStatement("SELECT round(seconds_between( started_at , finished_at) / 60  , 1 ) as Processing_Time_Mins, name as JobName, "
               +  "planned_time as Scheduled_time, Status, error_message from _SYS_XS.JOB_LOG "
               +  "where name LIKE 'plx_etl%' AND to_date(planned_time) = current_date order by scheduled_time asc ");
               
       
var pstmt1 = conn.prepareStatement("SELECT DATABASE_NAME FROM SYS.M_DATABASE"); 
var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  
 var rs = pstmt.executeQuery();
 var rs1 = pstmt1.executeQuery();
    
 if (rs1.next()) 
    {sid = rs1.getNString(1);        }
     
    var meta = rs.getMetaData();
    var i=1;
    var colCount = meta.getColumnCount();
    emailoutput = emailoutput + "<table border=\"2\"><tr bgcolor=\"LightSlateGrey\">";
    var message = "";
    var notification = "";

 
//Column Headings for both Email Body and Excel File
    for (i=1; i<= colCount ; i++)
    {
        emailoutput = emailoutput + "<th>" + meta.getColumnName(i) + "</th>";
     //   attachment  	+=  meta.getColumnName(i) + "\t";
    }
    emailoutput = emailoutput + "</tr>"; 
   // attachment = attachment+"\n";


    while(rs.next())
    {
       index = 4; 
        try
        {
            vals = rs.getString(index);
            data.push(vals);
            if (vals==="SUCCESS")
            {
                emailoutput=emailoutput+"<font color=\"GREEN\">";
                index ++;
                notification = " Jobs Completed ";
            }
            else
            {
                emailoutput=emailoutput+"<font color=\"RED\">";
                index ++;
                notification = "Jobs Failed.Check Error Jobs.";
            }
        }
        catch (e)
        {
                    message = e.message;
        }

 // Build Records for Email Body and Excel Attachment
          for (i = 1; i <= colCount ; i++)
          {
                  emailoutput = emailoutput + "<td>" + rs.getString(i) + "</td>";
             //     attachment = attachment +  rs.getString(i) + "\t";
          }

          emailoutput=emailoutput+"</tr>";
      //    attachment = attachment+"\n";
    }

    emailoutput = emailoutput + "</table>";

    rs.close();
    pstmt.close();
    rs1.close();
    pstmt1.close();
    conn.close();

 
  /*  var firstPart = new $.net.Mail.Part();
    firstPart.type = $.net.Mail.Part.TYPE_ATTACHMENT;
    firstPart.data = attachment; // data1 contains the data for the excel attachment
    firstPart.contentType = "application/vnd.ms-excel";
    firstPart.fileName = "JobStatus.xls";
    firstPart.encoding = "UTF-16le";
  */
    
    var thirdPart = new $.net.Mail.Part();
    thirdPart.type = $.net.Mail.Part.TYPE_TEXT;
    thirdPart.text = " Please Find Job Execution status.  <br>" + emailoutput + message + "<br><br>" + "End of Log" ;
    thirdPart.contentType = "text/html";
    thirdPart.encoding = "UTF-8";

    var mail = new $.net.Mail({

        sender: {address: "itreporting@plexxus.ca"},   
        to:
        [
            // {name: "Reporting Team", address: "ITReportingAnalytics@plexxus.ca", nameEncoding: "US-ASCII"}
             {name: "Migration Team", address: "kasa@pythian.com", nameEncoding: "US-ASCII"}
    
             
             ],
     
       // cc: [{name: "Sreekanth", address: "Sreekanth.Surampally@plexxus.ca", nameEncoding: "US-ASCII"},],

        subject: "HC Migration (Ignore) Job Status from System : " + sid + "-- on " + date,

        subjectEncoding: "UTF-8"
      
       });
     
     mail.parts.push(thirdPart);
    
    //mail.parts.push(thirdPart);
     mail.send();

  //  var response = "MessageId = " + returnValue.messageId + ", final reply = " + returnValue.finalReply;
    
  //  $.response.status = $.net.http.OK;
 //   $.response.contentType = "text/html";
 //   $.response.setBody(response);

}