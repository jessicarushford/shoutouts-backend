import express from "express";
import { ObjectId } from "mongodb";
import { getClient } from "../db";
import QueryStringParams from "../models/QueryStringParams";
import Shoutout from "../models/Shoutout";

const shoutoutRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

shoutoutRouter.get("/", async (req, res) => {
  try {
    const { to } = req.query;
    const params: QueryStringParams = {
      ...(to ? { to: to as string } : {}),
    };
    const client = await getClient();
    const results = await client
      .db()
      .collection<Shoutout>("shoutouts")
      .find(params)
      .toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

// shoutoutRouter.get("/trending", async (req, res) => {
//   try {
//     const client = await getClient();
//     const results = await client
//       .db()
//       .collection<Shoutout>("shoutouts")
//       .find()
//       .sort();
//   } catch (err) {
//     errorResponse(err, res);
//   }
// });
// Aggregation to do trending portion of extended challenge

shoutoutRouter.post("/", async (req, res) => {
  try {
    const newShoutout: Shoutout = req.body;
    const client = await getClient();
    client.db().collection<Shoutout>("shoutouts").insertOne(newShoutout);
    res.status(200).json(newShoutout);
    // shorthand^ instead of two lines
  } catch (err) {
    errorResponse(err, res);
  }
});

shoutoutRouter.delete("/:id", async (req, res) => {
  try {
    const id: string = req.params.id;
    const client = await getClient();
    const result = await client
      .db()
      .collection<Shoutout>("shoutouts")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.status(404);
      res.send(`ID of ${id} not found`);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

export default shoutoutRouter;
