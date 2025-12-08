export const replaceUsername = (username: string, emailBody: string) => {
    emailBody = emailBody.replace(/<username>/g, username);


    return emailBody;
}