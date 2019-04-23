My english is a RESTful API which integrates with MyEnglish chatbot. It's main purpose: provide API to save and load various data.

## Available endpoints

##### GET /api/students
To get all stored data
- - - -
##### GET /api/students/words/{messengerId}
To get all learned words for one student
- - - -
##### GET /api/students/revision/{messengerId}
To get a predifined number of random words from all learned words list
- - - -
##### POST /api/students/...
To save data into database

Required query paramaters:
* {messengerId}
* {englishLevel}
* {lessonRating}
* {newWords}
* {groupName}
* {learnedToday}
* {learnedTodayExtended}
