function validarLogin(email, senha) {
    if (!email || email.trim() === "") return "Email obrigatório";
    if (!senha || senha.trim() === "") return "Senha obrigatória";
    return "ok";
}

module.exports = {
    validarLogin,
};