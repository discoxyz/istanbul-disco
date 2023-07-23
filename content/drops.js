
const yourDate = new Date();
const currentDate = yourDate.toISOString().split("T")[0].toString();

export const drops = [
  {
    dropId: 1,
    hidden: false,
    secretLink: false,
    expired: false,
    dropName: "Mashas drop",
    dropPath: "masha_at_celo",
    schema: "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    credentialSubject: {
      eventName: "Masha at Disco",
      eventDate: "2023-07-19",
    },
  },  {
    dropId: 2,
    hidden: false,
    secretLink: false,
    expired: false,
    dropName: "Carl's drop",
    dropPath: "carl_yo",
    schema: "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    credentialSubject: {
      eventName: "Carl at Disco",
      eventDate: "2023-07-19",
    },
  }, {
    dropId: 3,
    hidden: false,
    secretLink: false,
    expired: false,
    dropName: "Evin IRL",
    dropPath: "evin_at_ethCC23",
    schema: "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    credentialSubject: {
      eventName: "Evin IRL @ ETHCC 2023",
      eventDescription: "You met Evin IRL at ETHCC 2023",
      eventDate: "2023-07-17",
    },
  },{
    dropId: 4,
    hidden: false,
    secretLink: false,
    expired: false,
    dropName: "Masha IRL",
    dropPath: "masha_at_ethCC23",
    schema: "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    credentialSubject: {
      eventName: "Masha IRL @ ETHCC 2023",
      eventDescription: "You met Masha IRL at ETHCC 2023",
      eventDate: "2023-07-17",
    },
  },{
    dropId: 5,
    hidden: false,
    secretLink: false,
    expired: false,
    dropName: "Carmen IRL",
    dropPath: "carmen_at_ethCC23",
    schema: "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    credentialSubject: {
      eventName: "Carmen IRL @ ETHCC 2023",
      eventDescription: "You met Carmen IRL at ETHCC 2023",
      eventDate: "2023-07-17",
    },
  },{
    dropId: 6,
    hidden: false,
    secretLink: false,
    expired: false,
    dropName: "CoOperate",
    dropPath: "celo_cooperate",
    schema: "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    credentialSubject: {
      eventName: "CoOperate",
      eventDescription: "Attended CoOperate Paris Mobile Day",
      eventDate: "2023-07-19",
    },
  },{
    dropId: 7,
    hidden: false,
    secretLink: false,
    expired: false,
    dropName: "LDF IRL",
    dropPath: "i_met_ldf",
    schema: "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    credentialSubject: {
      eventName: "LDF IRL",
      eventDate: currentDate,
    },
  },{
    dropId: 8,
    hidden: false,
    secretLink: false,
    expired: false,
    dropName: "AttestationNation Dinner",
    dropPath: "attestnation",
    schema: "https://raw.githubusercontent.com/discoxyz/disco-schemas/main/json/AttendanceCredential/1-0-0.json",
    credentialSubject: {
      eventName: "AttestationNation Dinner",
      eventDescription: "Participated in Disco’s Inaugural AttesationNation Dinner in Paris alongside Optimism, EAS, Gitcoin, PolygonID, District Labs, Lit Protocol, and XMTP",
      eventDate: "2023-07-16",
    },
  },
];
