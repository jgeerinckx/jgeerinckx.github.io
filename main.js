
// https://hivehub.dev/tx/372b4103ef62c9c28c687a3dbaf4db6251fa2026

window.onload = () => {

    if (window.hive_keychain) {
        hive_keychain.requestHandshake(() => { console.log('Keychain Found!') })
    } else alert('No \'window.hive_keychain\' Found')
}


// Get a reference to the form
const hiveForm = document.getElementById('hiveForm');

// Add an event listener for the form's submit event
hiveForm.addEventListener('submit', function(event) {
    // Prevent the default form submission (page reload)
    event.preventDefault(); 

    // Call your JavaScript function here
    handleSubmit();
});

// This is your JavaScript function that will be executed on submit
function handleSubmit() {
    // Get the values from your form
    const isActive = document.getElementById('active').checked;
    const hiveAccount = document.getElementById('hiveAccount').value;
    const apiUrl = document.getElementById('apiUrl').value;
    const postUrl = document.getElementById('postUrl').value;
    const rewardAccount = document.getElementById('rewardAccount').value;

    window.hive_keychain.requestCustomJson(hiveAccount, 'sm_update_validator', 'Active', JSON.stringify({
        "is_active": isActive,
        "post_url": postUrl,
        "api_url": apiUrl,
        "reward_account": rewardAccount
        }), 'Update validator', (response) => {
    console.log(response);
    });

}

