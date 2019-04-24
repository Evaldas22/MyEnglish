My english is a RESTful API which integrates with MyEnglish chatbot. It's main purpose: provide API to save and load various data.

## Available endpoints

##### GET /api/groups
To get all data about groups
- - - -
##### GET /api/group/{groupName}
To get all data about specified group
- - - -
##### POST /api/student/...
To save data into database

Required query paramaters:
* {messengerId}
* {englishLevel}
* {lessonRating}
* {lessonRatingExplanation}
* {newWords}
* {groupName}
* {learnedToday}
* {learnedTodayExtended}
* {firstName}
* {lastName}