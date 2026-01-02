const noop = () => { /* noop */ }
const todo = testName => {

  xit(testName, noop)
}

describe('CfbChangePassword', () => {

  describe('behavior', () => {
    todo('Should render new password required form when data-mode is new-password-required')
    todo('Should update form when data-mode attribute changes')

    // storage behavior
    todo('Should complete new password challenge successfully')
    todo('Should redirect to index page after new password success')
    todo('Should change password successfully in change mode')
    todo('Should clear form fields after successful password change')
    todo('Should dispatch cfb-password-change-success event on password change success')
    todo('Should disable submit button and show loading state during processing')
  })

  describe('stores to indexDB', () => {
    todo('Should save tokens after completing new password challenge')
    todo('Should clear temporary session storage after new password challenge')
    todo('Should dispatch cfb-password-change-success event on new password success')
  })

  describe('error cases', () => {
    todo('Should show error when temp password is empty in new-password-required mode')
    todo('Should show error when old password is empty in change mode')
    todo('Should show error when new password is empty')
    todo('Should show error when confirm password is empty')
    todo('Should show error when new passwords do not match')
    todo('Should show error when new password is same as old password in change mode')
    todo('Should show error message on password change failure')
    todo('Should dispatch cfb-password-change-error event on failure')
    todo('Should re-enable submit button after failed password change')
  })

  todo('Should escape HTML in error and success messages')
  todo('Should decode ID token and extract user info')
})

