export const schemas = [
  {
    name: "Attendance",
    schema: require("disco-schemas/json/AttendanceCredential/latest.json"),
  },
  {
    name: "Beta User",
    schema: require("disco-schemas/json/BetaUserCredential/latest.json"),
  },
  {
    name: "Certificate Of Completion",
    schema: require("disco-schemas/json/CertificateOfCompletionCredential/latest.json"),
  },
  {
    name: "Contribution",
    schema: require("disco-schemas/json/ContributionCredential/latest.json"),
  },  {
    name: "GM",
    schema: require("disco-schemas/json/GMCredential/latest.json"),
  },{
    name: "Guest Speaker",
    schema: require("disco-schemas/json/GuestSpeakerCredential/latest.json"),
  },{
    name: "Membership",
    schema: require("disco-schemas/json/MembershipCredential/latest.json"),
  },,{
    name: "Participation",
    schema: require("disco-schemas/json/ParticipationCredential/latest.json"),
  },
];