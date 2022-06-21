//Global variables 
var GlobalName, globalPin, GlobalJob;
var GlobalAccount, GlobalIncome, GlobalLoan;
var GlobalSavings, GlobalBalance;
var toAccount, toMoney;
var BankData, EnterPin;
var GlobalUserId, GlobalEmail, GlobalPhonenumber, GlobalAddress;

var restify = require("restify");
var builder = require("botbuilder");
var crypto = require("crypto");

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 6530, function () {
    console.log("%s listening", server.name);
});

//appID and AppPassword will be relevant for deployment
var connector = new builder.ChatConnector({
    appId: "",
    appPassword: ""
});
server.post("/api/messages", connector.listen());

var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector).set("storage", inMemoryStorage);

//intent initializattionvar 
var intents = new builder.IntentDialog();
bot.dialog("/", intents); // root dialogue


intents.onDefault([
    function (session, args, next) {

        if (!session.userData.name) {
            session.beginDialog('/Existing');
        }
        else {
            session.send("I didnt quite understand what you were trying to do.  Please try again. ")
        }
    },
    function (session, results) {

    }
]);
//Log in functions
bot.dialog("/Existing", [
    function (session) {
        session.send("Hi! I am Botty, i am your personal bank helper. Let us see if i can make your day easier.");
        //builder.Prompts.text(session, "Are you a existing bank customer? ");
        builder.Prompts.text(session, "How are you today?")
    },
    function (session, results) {

        session.send("Okey, sounds good ! ");
        session.send("Before we start i need to ask you something. ");
        session.beginDialog("/start");

    }
]);
bot.dialog("/start", [
    function (session) {
        builder.Prompts.text(session, "Are you an existing bank customer? ");
    },
    function (session, results) {
        var answer = results.response;

        if (answer == "yes" || answer == "Yes" || answer == "YES") {
            session.beginDialog("/YesCustomer");
        } else if (answer == "no" || answer == "No" || answer == "NO") {

            session.beginDialog("/Registrer")
        }

    }
]);

bot.dialog("/YesCustomer", [
    function (session) {
        builder.Prompts.text(session, "What is your name? ");
    },
    function (session, results) {

        session.userData.name = results.response;
        GlobalName = results.response;
        BankData = data.find(x => x.name == session.userData.name);
        globalPin = BankData.pin;


        session.beginDialog("/PinCode");
    }
]);
bot.dialog("/PinCode", [
    function (session) {
        builder.Prompts.text(session, "Too access your bank account. \n \
                                      Please enter your pin code? ");
    },
    function (session, results) {
        EnterPin = results.response;
        session.beginDialog("/CorrectCode")
    }
]);

bot.dialog("/CorrectCode", [
    function (session) {
        if (EnterPin == globalPin) {
            //To get the informasjon about the person then store it in global variables. 
            GlobalName = BankData.name;
            GlobalJob = BankData.Job;
            GlobalAccount = BankData.AccountNumber;
            GlobalIncome = BankData.income;
            GlobalLoan = BankData.loan;
            GlobalSavings = BankData.Savings;
            GlobalBalance = BankData.Balance;
            GlobalUserId = BankData.Id;
            GlobalPhonenumber = BankData.Phonenumber;
            GlobalAddress = BankData.Address;
            GlobalEmail = BankData.Email;

            session.endDialog("How may i help you, %s?", BankData.name);
        } else {

            session.send("You typed the wrong pin try again.");
            session.beginDialog("/PinCode");
        }
    }
]);

//Intent to check balance. 
intents.matches(/^^(?=.*\bbalance\b).*$/i, [
    function (session) {
        session.send("Hey, your bank balance is %d", GlobalBalance);

    },
    function (session, results) {
        session.send("Do you need anything else? ");
        session.endDialog();
    }
]
);
//A method to quit. 
intents.matches(/^^(?=.*\bgoodbye\b).*$/i, [
    function (session) {

        session.endDialog()
        session.endConversation()
        session.send("Okey %s! Have a very nice day! ", GlobalName);

    }
]
);
//Show the info on this person. 
intents.matches(/^^(?=.*\bshow\b)(?=.*\baccount\b)(?=.*\binfo\b).*$/i, [
    function (session) {
        session.send("Here is a overview of your account: \r\n \
                    Name: %s \r\n \
                    Email: %s \r\n \
                    Address: %s \r\n \
                    Phonenumber: %s \r\n \
                    Balance: %s \r\n \
                    Savings: %s \r\n \
                    ", GlobalName, GlobalEmail, GlobalAddress, GlobalPhonenumber, GlobalBalance, GlobalSavings);
        session.send("Do you need anything else? ");
        session.endDialog();
    }
]
);
//Updating account info, depends on the user.
intents.matches(/^^(?=.*\bupdate\b)(?=.*\baccount\b)(?=.*\binfo\b).*$/i, [
    function (session) {
        session.send("Here is the options to change your account info: ", GlobalBalance);
        session.beginDialog("/UpdateProfile");

    },
    function (session, results) {

        session.endDialog();
    }
]
);
bot.dialog("/UpdateProfile", [
    function (session) {
        builder.Prompts.choice(session, "Here is the opnts to change your account info: ",
            " Email| Phonenumber | Address | Change pin |Quit ")
    },
    function (session, results) {
        switch (results.response.index) {
            case 0:
                session.beginDialog("/ChangeEmail");
                break;
            case 1:
                session.beginDialog("/ChangePhonenumber");
                break;

            case 2:
                session.beginDialog("/ChangeAddress");
                break;

            case 3:
                session.beginDialog("/ChangeChangePin");
                break;
            default:
                session.send("Do you need anything else? ")
                session.endDialog();
                break;
        }
    }
]); 
//If there is a error with email.  If it miss @. 
bot.dialog("/ChangeEmail", [
    function (session) {
        builder.Prompts.text(session, "What is the new E-mail ?  ");
    },
    function (session, results) {
        const tempt1 = results.response;
       
        if (tempt1.includes("@") && tempt1.includes("@")) {
          

            GlobalEmail = tempt1;

            session.send("Your new E-mail is: \r\n %s", tempt1);
            session.send("Do you want to keep changing ?  ");
            session.beginDialog("/UpdateProfile");

        } else {

            session.send("Invalid Email. Missing @.")
            session.beginDialog("/TryAgainEmail");

        }

    }
]);

bot.dialog("/TryAgainEmail", [
    function (session) {
        session.beginDialog("/ChangeEmail");
    },
    function (session, results) {
        session.endDialog();
    }
]);

bot.dialog("/ChangePhonenumber", [
    function (session) {
        builder.Prompts.text(session, "What is your new phone number? ");
    },
    function (session, results) {
        temp2 = results.response;

        if (isNaN(temp2)) {
            session.send("Invalid phone number, it can only contain numbers. Try again. ")
            session.beginDialog("/TryAgainPhone");

        } else {
            session.send("Your new Phone number is\r\n %s", temp2);
            GlobalPhonenumber = results.response;
            session.beginDialog("/UpdateProfile");
        }
    }
]);
//IF there is a error with the phone number. If it contains letters. 
bot.dialog("/TryAgainPhone", [
    function (session) {
        session.beginDialog("/ChangePhonenumber");
    },
    function (session, results) {
        session.endDialog();
    }
]);

bot.dialog("/ChangeAddress", [
    function (session) {
        builder.Prompts.text(session, "What is your new address? ");
    },
    function (session, results) {
        GlobalAddress = results.response;
        session.send("Your new address is:  %s", GlobalAddress);
        session.beginDialog("/UpdateProfile");
    }
]);

bot.dialog("/ChangeChangePin", [

    function (session) {
        builder.Prompts.text(session, "What is your new pin code  number? ");
    },
    function (session, results) {
        temp3 = results.response;

        if (isNaN(temp3)) {
            session.send("Invalid phone number, it can only contain numbers. Try again. ")
            session.beginDialog("/TryAgainPinCode");

        } else {
            session.send("Your new Phone number is\r\n %s", temp3);
            GlobalPhonenumber = results.response;
            session.beginDialog("/UpdateProfile");
        }
    }
]); 

bot.dialog("/TryAgainPinCode", [
    function (session) {
        session.beginDialog("/ChangePhonenumber");
    },
    function (session, results) {
        session.endDialog();
    }
]);

//Transaction History. 
intents.matches(/^^(?=.*\btransaction\b).*$/i, [
    function (session) {

        session.beginDialog("/TransactionHistory");
    },
    function (session, results) {


        session.send("Do you need anything else? ");

    }
]
);

bot.dialog("/TransactionHistory", [
    function (session) {

        var result = "";

        for (var i = 0; i < data[GlobalUserId].TransactionHistory.length; i++) {
            var item = data[GlobalUserId].TransactionHistory;
            result = result + item[i].date + " " + item[i].Place + ": " + item[i].Price + " Kr" + "\r\n";
        }

        session.send("Here is a overview of your transactions: " + "\r\n" + result);
        session.endDialog();
    }
])


//Paying the bills.
intents.matches(/^^(?=.*\bbills\b).*$/i, [
    function (session) {
        session.send("Hey, i see that you need some help to pay some bills");

        session.beginDialog("/Bills");


    },
    function (session, results) {

        session.send("The transaction has been completed \r\n \
                        From: %s\r\n \
                        To:%s\r\n \
                        Amount: %d Kr\r\n \
                        Balance:%d Kr", GlobalAccount, toAccount, toMoney, GlobalBalance);
        session.send("Do you need anything else?");
    }
]
);

bot.dialog("/Bills", [
    function (session) {
        builder.Prompts.text(session, "Who do you want to pay too? ");

    },
    function (session, results) {
        toAccount = results.response;
        session.beginDialog("/TransferMoney")

    }
]);
bot.dialog("/TransferMoney", [
    function (session) {
        builder.Prompts.text(session, "Amount?");
    },
    function (session, results) {

        var temp4 = results.response;

        if (isNaN(temp4)) {
            session.send("The number is invalid, it can only contain numbers. Try again");
            session.beginDialog("/TryAgainTransfer");
        } else {

            toMoney = results.response;
            if (GlobalBalance > toMoney) {
                GlobalBalance -= toMoney;
                result = "";

                var datetime = new Date();
                let date = datetime.getDate();
                let month = datetime.getMonth() + 1;
                let year = datetime.getFullYear();

                var CurrentDate = date + "." + month + "." + year;
                
                dict = {
                    date: CurrentDate,
                    Place: toAccount,
                    Price: toMoney
                }

                var item = data[GlobalUserId].TransactionHistory;

                item.push(dict);



                session.send(result);
                session.endDialog();
            } else {
                    session.send("You dont have enough balance on your bank account.")
                    session.send("Try again with another total amount.")
                    session.beginDialog("/TryAgainMoney");
                  }
        }
    }

]);
bot.dialog("/TryAgainTransfer", [
    function (session) {
        session.beginDialog("/TransferMoney");
    },
    function (session, results) {
        session.endDialog();
    }
]);

bot.dialog("/TryAgainMoney", [
    function (session) {
        session.beginDialog("/TransferMoney");
    },
    function (session, results) {
        session.endDialog();
    }
]);


//If the customer is not part of the bank 

bot.dialog("/TryAgainCustomer", [
    function (session) {

    },
    function (session, results) {

    }
]);
//GJØR DETTE HER FERDIG IMORGEN. 
bot.dialog("/Registrer", [
    function (session) {
        session.send("Welcome to registration")
        builder.Prompts.text(session, "What is your name? ");
    },
    function (session, results) {
        GlobalName = results.response;

        // session.beginDialog("/bankmenu")f
    }
]);

//TEST DATA 

const data = [
    {
        name: "Ole Nordmann",
        pin: 1331,
        Id: 0,
        Job: "Yes",
        AccountNumber: 1234,
        income: 50000,
        loan: 1000,
        Savings: 10000000,
        Balance: 5500,
        Email: "Olenordmann@gmail.com",
        Address: "Main road 1 ",
        Phonenumber: 12345678,
        TransactionHistory: [
            {
                date: "31.01.2020", Place: "Coop Mega", Price: 500,
            },
            {
                date: "03.02.2020", Place: "Coop Prix", Price: 200,
            },
            {
                date: "07.02.2020", Place: "Coop Obs", Price: 1000,
            },
        ],
    },
    {
        name: "Hans Petter",
        pin: 1234,
        Id: 1,
        Job: "No",
        AccountNumber: 4321,
        income: 0,
        loan: 50000,
        Savings: 50,
        Balance: 420,
        Email: "Hans Petter@gmail.com",
        Address: "Main road 2 ",
        Phonenumber: 241512311,
        TransactionHistory: [
            {
                date: "02.03.2020 ", Place: "Rema 100", Price: 500,
            },
            {
                date: "02.02.2020", Place: "Narvesen", Price: 200,
            },
            {
                date: "23.03.2020", Place: "Coop Obs", Price: 1000,
            },
        ]
    },
    {
        name: "Julie Hansen",
        pin: 4200,
        Id: 2,
        Job: "Yes",
        AccountNumber: 5678,
        income: 500000,
        loan: 400000,
        Savings: 10000,
        Balance: 4000,
        Email: "Testname@gmail.com",
        Address: "Off-road 3 ",
        Phonenumber: 12345678,
        TransactionHistory: [
            {
                date: "31.01.2020", Place: "VALORANT", Price: 500,
            },
            {
                date: "32.02.2020", Place: "LEAGUE OF LEGENDS", Price: 200,
            },
            {
                date: "23.03.2020", Place: "Coop Obs", Price: 1000,
            },
        ]
    }
]
