# term-project-sl3zt1nhcs-gupeht
Project management Link: [https://www.notion.so/c9bb896ddb6d4fbaa63981ied939eff08?v=05286ec6f8d946cca526923d529179d4&pvs=4](https://global-authority-ffd.notion.site/c9bb896ddb6d4fbaa63981ed939eff08?v=05286ec6f8d946cca526923d529179d4)



#  Instructions for group to test code under dev
By: Sharif Mohamed

   MAKE SURE YOU HAVE A .ENV INSIDE BACKEND/SRC/CONFIG FOLDER AND SET THE ENV VARIABLE OTHERWISE AUTHORIZATION WILL FAIL

    You need to run node database.js in your local computer
    but before this make sure you have installed vs code extension for postgresql. Check package.json for dependencies.

    1.install postgress  on your machine

    3. Ensure your db server is running in your local 

    4. make sure you have a default db name postgres or change the code to reflect the db name you have

    5. when you run nodemon server.js it will create the tables automatically if dont exist

    To run webpack and nodemon as dev:

         in your branch do  a git reset  --hard development
                          then cd frontend/src
                          npm  run dev
                          then  in a new terminal go backend/src 
                          do nodemon server.js
                          make sure if you dont have to do npm install but inside frontend/src and backend/src


05/06/23
Milestone 2 Left TO DO:


Hey team,

I have force pushed my revised code into the development branch
since i fixed most of the issues not solved on the development code 
which still buggy. The only difference is the style of database but I already fixed.


Akash is busy today so I need Devin and Antonio to complete the todo on the code which the the models to join game. This is include making a new protected router for the game which will be blank now

Also we need the front end and back end socket configuration added to this code. Dont use the old one but implement one with a very basic functionality

List of things that works and problems:

register : works and add user to database with auth_token
login: works and retrieves login from database
logout: works and removes the token from database
createGame: works and insert gameData on database

front end code: the models display the game list and display if game exist and create game if does not exist


Issues: 

low priority
I put buy out instead of buy in somewhere in the code ( just a grammar isssue)

low priority
if you type in the browser http://localhost:3000/user/lobby when already login will cause error 401 but in the postman shows 200. So in the browser just put the http://localhost:3000 and will redirect to lobby. this does not stop the code from work. ill fix it

05/07/23
Milestone 3 TO DO:

implement game and chat functionality




WE GET PUSH HARDER GUYS WE ALMOST DONE


ill be out for today but the code will be on development.

MEETING TOMORROW 6 P.M.





