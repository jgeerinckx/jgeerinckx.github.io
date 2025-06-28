var hiveAccount = ""
var hiveForm
var logInForm
var voteForm

// Code that runs on load of page

window.onload = () => {

    if (window.hive_keychain) {
        hive_keychain.requestHandshake(() => { console.log('Keychain Found!') })
    } else alert('No \'window.hive_keychain\' Found')

    function addEventListenerToElement(element, func){
        element.addEventListener('submit', function(event) {
        // Prevent the default form submission (page reload)
        event.preventDefault(); 

        // Call your JavaScript function here
        func();
    });
    }
    hiveForm = document.getElementById('hiveForm');
    addEventListenerToElement(hiveForm, handleUpdateValidator);
    logInForm = document.getElementById('logIn');
    addEventListenerToElement(logInForm, handleLogIn);
    voteForm = document.getElementById('voteFor');
    addEventListenerToElement(voteForm, handleVote);
}

// Code for log in and out

function handleLogIn() {
    hiveAccount = logInForm.querySelector('#hiveAccount').value;
    window.hive_keychain.requestSignBuffer(hiveAccount, `auth_check${Date.now()}`, 'Posting', (result) => {
        if(result.success){
            logInForm.style.display = "none";
            document.getElementById("validatorForm").style.display = "block";
            document.getElementById("logOutButton").value = `Log out (${hiveAccount})`;
            getVotes();
            getValidatorData();
        };
    });
}

function handleLogOut() {
    logInForm.style.display = "block";
    document.getElementById("validatorForm").style.display = "none";
    hiveAccount = ""
}

// Code about voting

function handleVote() {
    validatorName = voteForm.querySelector('#validatorName').value;
    window.hive_keychain.requestCustomJson(hiveAccount, 'sm_approve_validator', 'Active', JSON.stringify({
        "account_name": validatorName
        }), 'Vote for validator', (response) => {
        console.log(response);
        if (response.success) {
            setTimeout(() => {getVotes();}, 15000);
            voteForm.querySelector('#validatorName').value = "";
        };
    });
}

// Code to get current validator data

async function getValidatorData() {
    try {
        const response = await fetch(`https://splinterlands-validator-api.splinterlands.com/validator?account=${hiveAccount}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiResponse = await response.json();
        if (apiResponse != null) {
            document.getElementById("active").checked = apiResponse["is_active"]
            document.getElementById("apiUrl").value = apiResponse["api_url"]
            document.getElementById("postUrl").value = apiResponse["post_url"]
            document.getElementById("rewardAccount").value = apiResponse["reward_account"]
        }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
}

async function getVotes() {
    try {
        const response = await fetch(`https://splinterlands-validator-api.splinterlands.com/votes_by_account?account=${hiveAccount}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiResponse = await response.json();
        const listItemsArray = apiResponse.map(createVotersList)
        document.getElementById("votedValidators").innerHTML = listItemsArray.join('')
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
}

function createVotersList(data){
    return `
        <li style="display:flex;justify-content: space-between;">
            <p>${data.validator}</p>
            <button onclick=removeVote('${data.validator}') style="margin-block:10px;margin-left: 10px;">Remove Vote</button>
        </li>
    `
}

function removeVote(validatorName) {
     window.hive_keychain.requestCustomJson(hiveAccount, 'sm_unapprove_validator', 'Active', JSON.stringify({
        "account_name": validatorName
        }), 'Remove vote validator', (response) => {
    console.log(response);
    if (response.success) {
            setTimeout(() => {getVotes();}, 15000)
        };
    });
}

// Code to update validator

function handleUpdateValidator() {
    const isActive = hiveForm.querySelector('#active').checked;
    const apiUrl = hiveForm.querySelector('#apiUrl').value;
    const postUrl = hiveForm.querySelector('#postUrl').value;
    const rewardAccount = hiveForm.querySelector('#rewardAccount').value;

    window.hive_keychain.requestCustomJson(hiveAccount, 'sm_update_validator', 'Active', JSON.stringify({
        "is_active": isActive,
        "post_url": postUrl,
        "api_url": apiUrl,
        "reward_account": rewardAccount
        }), 'Update validator', (response) => {
    console.log(response);
    });

}

