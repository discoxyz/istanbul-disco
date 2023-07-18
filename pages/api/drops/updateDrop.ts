// SHAPE
// CREATE TABLE Drops (
//   uuid UUID NOT NULL,
//   name VARCHAR(255) NOT NULL,
//   path VARCHAR(255) NOT NULL,
//   schema VARCHAR(255) NOT NULL,
//   subjectData JSONB NOT NULL,
//   start_time TIMESTAMPTZ,
//   end_time TIMESTAMPTZ,
//   claimable INTEGER,
//   added TIMESTAMPTZ DEFAULT NOW(),
//   added_by VARCHAR(255),
//   PRIMARY KEY (uuid)
// )
// CREATE TABLE Eligible (
//   address VARCHAR(255) NOT NULL,
//   dropId VARCHAR(255) NOT NULL,
//   claimed boolean,
// );

import { sql } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";

// }
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = JSON.parse(req.body);
  const updatedFields: {
    name?: string;
    path?: string;
    schema?: string;
    subjectData?: string;
    startTime?: string;
    endTime?: string;
    claimable?: string;
    addedBy?: string;
  } = body;

  const { uuid } = body;
  // const parsedStartTime = startTime && startTime;
  // const parsedEndTime = endTime && endTime;
  try {
    const update: string[] = [];
    Object.entries(updatedFields).map(([key, value]) => {
      let val = value;
      if (key === "subjectData") val = JSON.stringify(value);
      if (typeof val === "string") val = val;
      if (key == "uuid") return;
      update.push(`${key} = ${val}`);
    });

    const setClause = "name = hello" ;

    console.log(setClause)
    const query = sql`
      UPDATE Drops
      SET ${setClause}
      WHERE uuid = ${uuid}
    `;

    // console.log("QUERY RUN", query);

    res.status(200).send({
      success: true,
      message: "Drop updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: `Failed to update Drop`,
    });
  }
};

export default handler;
