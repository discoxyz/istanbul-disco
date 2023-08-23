export const issueCredential = async (
  schemaUrl: string,
  address: string,
  subjectData: {}
) => {
  const apiKey = process.env.DISCO_API_KEY;
  const requestUrl = "https://api.disco.xyz/v1/credential";
  const recipient = address.startsWith("0x") ? `did:ethr:${address}` : address;
  const requestBody = JSON.stringify({
    schemaUrl: schemaUrl,
    recipientDID: recipient,
    subjectData: subjectData,
  });

  try {
    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      // await response.json()
      console.log(response)
      console.error("error in response");
      throw new Error("Failed to issue credential");
    }

    if (response.status == 504) {
      throw new Error("Disco API Timeout");
    }

    await response.json();
    return true;
  } catch (error) {
    console.error("Failed to issue credential:", error);
    throw error;
  }
};
