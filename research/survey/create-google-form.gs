/**
 * Creates the CampusRun student survey as a Google Form in one click.
 *
 * 1. Go to https://script.google.com → New project
 * 2. Paste this whole file, click Run (▶) on createCampusRunSurvey, and allow access
 * 3. The log (View → Logs) prints the form link to share and the edit link
 *
 * Question wording matches research/survey/analyze.py, so the CSV export
 * (Responses → Download responses (.csv)) can go straight into the script.
 */
function createCampusRunSurvey() {
  var form = FormApp.create('GIM Food & Delivery Survey (2 min)');
  form.setDescription('We are Team Syntara (GIM) researching how students get food on campus for the Swiggy Food for Thought case competition. Anonymous, takes 2 minutes. Thank you!');
  form.setCollectEmail(false);

  form.addMultipleChoiceItem().setTitle('Year / programme')
    .setChoiceValues(['PGDM Year 1', 'PGDM Year 2', 'PGDM-HCM / BDA / other', 'Other']).setRequired(true);
  form.addTextItem().setTitle('Hostel block');
  form.addMultipleChoiceItem().setTitle('In the last 30 days, how many times did you eat food NOT from the mess?')
    .setChoiceValues(['0', '1–3', '4–8', '9–15', '15+']).setRequired(true);
  form.addCheckboxItem().setTitle('Where did that food come from?')
    .setChoiceValues(['Campus canteen / food court', 'Someone drove to town', 'Delivery app', 'Friends brought it', 'Other']);
  form.addMultipleChoiceItem().setTitle('Have you tried to order on Swiggy or another app to campus and found it not serviceable or too slow?')
    .setChoiceValues(['Yes, often', 'Yes, once or twice', 'Never tried', 'No, it worked']).setRequired(true);
  form.addTextItem().setTitle('If delivery reached campus, how far is the hand-off point from your room, and how many minutes do you spend walking and waiting? (minutes)');
  form.addCheckboxItem().setTitle('When are you most likely to want outside food?')
    .setChoiceValues(['Lunch', 'Evening snacks', 'Dinner', 'After 11 PM']);
  form.addMultipleChoiceItem().setTitle('What do you usually spend per outside meal?')
    .setChoiceValues(['< ₹150', '₹150–250', '₹250–400', '₹400+']);
  form.addCheckboxItem().setTitle('Which of these frustrate you most? (pick up to 3)')
    .setChoiceValues(['Not serviceable', 'Delivery and other fees', 'Waiting at the gate', 'Minimum order', 'Coordinating group orders', 'Mess quality']);
  form.addScaleItem().setTitle('Concept: 3 fixed delivery runs a day to a campus drop point, ₹15 run fee, no small-cart fee. How likely are you to use it at least once a week? (1-5)')
    .setBounds(1, 5).setLabels('Not at all', 'Definitely').setRequired(true);
  form.addMultipleChoiceItem().setTitle('Would you wait for a fixed slot (e.g. 8:30 PM) if it saved you ₹40+ per meal?')
    .setChoiceValues(['Yes', 'Maybe', 'No']).setRequired(true);
  form.addMultipleChoiceItem().setTitle('How often would you order with roommates or your wing to split costs?')
    .setChoiceValues(['Never', 'Sometimes', 'Usually']);
  form.addMultipleChoiceItem().setTitle('Would you use an AI assistant that builds a group cart within a budget ("dinner for 4 under ₹900")?')
    .setChoiceValues(['Yes', 'Maybe', 'No']);
  form.addMultipleChoiceItem().setTitle('Would you work as a paid Campus Captain for ~30 minutes per run?')
    .setChoiceValues(['Yes', 'Maybe', 'No']);
  form.addParagraphTextItem().setTitle('Anything else about food on campus?');

  Logger.log('Share this link: ' + form.getPublishedUrl());
  Logger.log('Edit / responses: ' + form.getEditUrl());
}
