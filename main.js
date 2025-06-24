
// https://hivehub.dev/tx/372b4103ef62c9c28c687a3dbaf4db6251fa2026
var hiveAccount = ""
var hiveForm
var logInForm
var voteForm

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



function handleLogIn() {
    hiveAccount = logInForm.querySelector('#hiveAccount').value;
    window.hive_keychain.requestSignBuffer(hiveAccount, `auth_check${Date.now()}`, 'Posting', (result) => {
        if(result.success){
            logInForm.style.display = "none";
            document.getElementById("validatorForm").style.display = "block";
            document.getElementById("logOutButton").value = `Log out (${hiveAccount})`;
            getVotes();
        };
    });
}

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
            <button onclick=removeVote('${data.validator}')>Remove Vote</button>
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

function handleLogOut() {
    logInForm.style.display = "block";
    document.getElementById("validatorForm").style.display = "none";
    hiveAccount = ""
}

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

