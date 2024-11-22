function status(request, response) {
  response.status(200).json({ message: "Eu sou acima da média" });
}

export default status;
