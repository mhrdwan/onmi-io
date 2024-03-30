require("dotenv").config();
const { default: axios } = require("axios");

async function createEmail() {
  const options = {
    method: "GET",
    url: "https://temp-mail94.p.rapidapi.com/new-mail",
    headers: {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "temp-mail94.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
async function cekMessage(data, index) {
  let pengulang = 0;
  while (pengulang < 5) {
    const options = {
      method: "GET",
      url: "https://temp-mail94.p.rapidapi.com/mail-box",
      params: {
        email: data.email,
        token: data.token,
      },
      headers: {
        "X-RapidAPI-Key": process.env.API_KEY,
        "X-RapidAPI-Host": "temp-mail94.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      // console.log(response.data[0].body_text);
      await delay(2000);
      if (response?.data.length === 0) {
        // console.log("kode belum ditemukan, mencari kembali...");
        pengulang++;
      } else if (pengulang == 5) {
        console.log(
          "Sudah mengulang sebanyak 5 kali, melanjutkan yang lain..."
        );
      } else {
        var regex = /\[Verify\]\((.*?)\)/;
        var bodyText = response?.data[0]?.body_text;
        var match = regex.exec(bodyText);

        if (match) {
          var link = match[1];
          //   console.log("Link:", link);
          const codeSlice = link.slice(29, 46);
          //   console.log(codeSlice);
          await verifOnmi(codeSlice, index, data);
          break;
        } else {
          console.log("Tidak ada link yang ditemukan.");
        }
        break;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
// cekMessage();

async function verifOnmi(kode, index, data) {
  const body = { code: kode };
  try {
    const response = await axios.post(
      "https://onmi-waitlist.rand.wtf/api/activate",
      body
    );
    // console.log(response.data);
  } catch (error) {}
  console.log(`[${index}] ${data.email} ✅`);
}

async function CreateOnmi(index) {
  let dataEmail = await createEmail();
  const body = {
    email: dataEmail.email,
    nickname: dataEmail.email,
    password: dataEmail.email,
    password_confirmation: dataEmail.email,
    invite_code: process.env.INV_CODE,
  };
  try {
    const response = await axios.post(
      "https://onmi-waitlist.rand.wtf/api/register",
      body
    );
    // console.log(response.data);
    await cekMessage(dataEmail, index);
  } catch (error) {}
}

async function loop() {
  let renya = 0;
  for (let index = 0; index < process.env.JUMLAH_REF; index++) {
    await CreateOnmi(index + 1);
    renya++;
  }
  console.log(`Sudah selesai dengan ref`, renya);
}
loop();
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
