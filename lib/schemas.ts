export const schemas = [
  {
    name: "Attendance",
    calloutField: "eventName",
    schema: require("disco-schemas/json/AttendanceCredential/latest.json"),
  },
  {
    name: "Beta User",
    calloutField: "name",
    schema: require("disco-schemas/json/BetaUserCredential/latest.json"),
  },
  {
    name: "Bookmark",
    calloutField: "publication",
    schema: require("disco-schemas/json/BookmarkCredential/latest.json"),
  },
  {
    name: "Certificate Of Completion",
    calloutField: "nameOfCourse",
    schema: require("disco-schemas/json/CertificateOfCompletionCredential/latest.json"),
  },
  {
    name: "Contribution",
    calloutField: "name",
    schema: require("disco-schemas/json/ContributionCredential/latest.json"),
  },
  {
    name: "GM",
    schema: require("disco-schemas/json/GMCredential/latest.json"),
  },
  {
    name: "Guest Speaker",
    calloutField: "name",
    schema: require("disco-schemas/json/GuestSpeakerCredential/latest.json"),
  },
  {
    name: "Membership",
    calloutField: "organization",
    schema: require("disco-schemas/json/MembershipCredential/latest.json"),
  },
  {
    name: "Participation",
    calloutField: "eventName",
    schema: require("disco-schemas/json/ParticipationCredential/latest.json"),
  },
];
