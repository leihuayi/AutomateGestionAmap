function sendReminders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // STEP 1: create dict with key=name, value=email
  const sheetIdentities = ss.getSheetByName('Liste Avril - Sept 24');
  const identities = sheetIdentities.getRange('A2:E30').getValues();
  var dicIdentities = {};

  for (var i = 0; i < identities.length; i++) {  
    dicIdentities[identities[i][0]] = identities[i][4];
  }
  // Logger.log(dicIdentities);


  // STEP 2: go through planning sheet
  const sheetPlanning = ss.getSheetByName('Planning Oct 24/Mar 25');
  const today = new Date();
  const inTenDays = new Date();
  const inThreeDays = new Date();
  inTenDays.setDate(inTenDays.getDate() + 3)
  inThreeDays.setDate(inThreeDays.getDate() + 10)

  var emptyDistributions = []

  for (var i = 1; i < 7; i++) {
    var plannedPeople = sheetPlanning.getRange('B'+(5*i-2)+':F'+(5*i+1)).getValues();
    for (var j = 0; j < 6; j++) {
      var distribDate = plannedPeople[0][j];
      var firstDistributer = plannedPeople[2][j];
      var secondDistributer = plannedPeople[3][j];

      if (distribDate > today && distribDate < inTenDays){

        // if no one for distribution:
        // prepare email to send to all Amap members
        // where we list the dates when no one signed in (max 2)
        if (firstDistributer == '' && secondDistributer == ''){
          emptyDistributions.push(convertDate(distribDate));
        }
        
        else {
          if (distribDate < inThreeDays){
            // if people are inscribed for the incoming distribution:
            // send email reminder to these people only

            var recipients = [dicIdentities[firstDistributer], dicIdentities[secondDistributer]];
            recipients = recipients.filter(Boolean).join(", ");
            sendHowToDoDistributionEmail(recipients, convertDate(distribDate))
          }
        }

      } 
    }
  }

  if (emptyDistributions.length > 0){
    emptyDistributions = emptyDistributions.filter(Boolean).join(" et ");
    sendAskingMembersToSignInEmail(emptyDistributions);
  }
}

function sendHowToDoDistributionEmail(recipients, distribDate){
  Logger.log('Email for distribution explanation sent to '+recipients)
  MailApp.sendEmail({
    to: recipients,
    subject: "Pour ta distribution à l'AMAP du "+distribDate,
    htmlBody: "Bonjour, tu es inscrit pour la prochaine distribution à l'AMAP du Landy et tous les membres t'en remercient !",
  });  
}

function sendAskingMembersToSignInEmail(emptyDistributions){
  MailApp.sendEmail({
    to: "leihuayi@gmail.com",
    subject: "AMAP du Landy: Besoin de volontaires pour les prochaines distributions",
    htmlBody: "Il manque des personnes pour distribuer aux dates suivantes:"+emptyDistributions,
  });
  Logger.log('Email for asking members to sign in to '+emptyDistributions+' distributions sent')
}

function convertDate(d){
  return d.getDate()+'/'+d.getMonth();
}
