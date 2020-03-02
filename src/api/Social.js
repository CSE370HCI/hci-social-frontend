function submitJson(formname, suburl, data, callback, userid, apikey){
  var form = data;
  if (!form){
    form = $(formname).serializeJSON();
  if (userid){
     form["user_id"] = userid;
  }
  if (apikey){
     form["session_token"] = apikey;
  }
  }
  //console.log(form);

  $.ajax(
    {
      url : suburl,
      type: "POST",
      dataType   : 'json',
      contentType: 'application/json; charset=UTF-8',
      data : JSON.stringify(form),
      success:function(maindta)
     {
        if (callback){
          callback(maindta);
        }
 else {
        $("#display").html("<pre>" + JSON.stringify(maindta, null, 2) + "</pre>");
       }
      },
     error: function(jqXHR, textStatus, errorThrown)
      {
        var message = "ERROR:"+errorThrown;
        alert(message);
      }
    })
   return false;
  }

  function getJson(suburl, callback){
    $.ajax(
      {
        url : suburl,
        type: "GET",

        success:function(maindta)
       {
          callback(maindta);
       },
       error: function(jqXHR, textStatus, errorThrown)
     {
       var message = "ERROR:"+errorThrown;
      alert(errorThrown);
      }
     })
   }
