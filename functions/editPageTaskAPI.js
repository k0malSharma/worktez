/* eslint-disable object-curly-spacing */
/* eslint-disable no-undef */
/* eslint-disable require-jsdoc */
/* eslint-disable eol-last */
/* eslint-disable indent */
/* eslint-disable max-len */
// eslint-disable-next-line no-dupe-else-if

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const Activity = require("./addActivity");

const admin = require("firebase-admin");

const db = admin.firestore();

exports.editPageTask = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        console.log(request.body.data);

        const appKey = request.body.data.AppKey;
        const description = request.body.data.Description;
        const priority = request.body.data.Priority;
        const difficulty = request.body.data.Difficulty;
        const assignee = request.body.data.Assignee;
        const estimatedTime = request.body.data.EstimatedTime;
        const project = request.body.data.Project;
        const storyPointNumber = request.body.data.StoryPointNumber;
        const editedSprintNumber = request.body.data.SprintNumber;
        const previousId = request.body.data.PreviousId;
        const creationDate = request.body.data.CreationDate;
        const changedData = request.body.data.ChangedData;
        const previousSprintId = createSprintId(previousId);
        const taskId = request.body.data.Id;
        const editedSprintId = createSprintId(editedSprintNumber);
        let totalNumberOfTask;
        let result;
        let totalUnCompletedTask;
        let totalCompletedTask;
        let sprintEditPromise;
        const date = request.body.data.Date;
        const time = request.body.data.Time;
        let comment = "Edited task details: ";

        const promises = [];

        const editTaskPromise = db.collection("Organizations").where("AppKey", "==", appKey).get().then((org) => {
            org.forEach((doc) => {
                documentID = doc.data().OrganizationDomain;
            });

            console.log("DocumentID = " + documentID);

            if (editedSprintNumber !== previousId) {
                comment += "Moved to sprint " + editedSprintId + ". ";
                const p1 = db.collection("Organizations").doc(documentID).collection("Sprints").doc(previousSprintId).get().then((doc) => {
                    totalNumberOfTask = doc.data().TotalNumberOfTask;
                    totalUnCompletedTask = doc.data().TotalUnCompletedTask;

                    totalNumberOfTask = totalNumberOfTask - 1;
                    totalUnCompletedTask = totalUnCompletedTask - 1;
                    const editSprintDeleteCounter = db.collection("Organizations").doc(documentID).collection("Sprints").doc(previousSprintId).update({
                        TotalNumberOfTask: totalNumberOfTask,
                        TotalUnCompletedTask: totalUnCompletedTask,
                    });
                    return Promise.resolve(editSprintDeleteCounter);
                });
                promises.push(p1);

                const p2 = db.collection("Organizations").doc(documentID).collection("Sprints").doc(editedSprintId).get().then((doc) => {
                    if (doc.exists) {
                        totalNumberOfTask = doc.data().TotalNumberOfTask;
                        totalUnCompletedTask = doc.data().TotalUnCompletedTask;

                        totalNumberOfTask = totalNumberOfTask + 1;
                        totalUnCompletedTask = totalUnCompletedTask + 1;

                        sprintEditPromise = db.collection("Organizations").doc(documentID).collection("Sprints").doc(editedSprintId).update({
                            TotalUnCompletedTask: totalUnCompletedTask,
                            TotalNumberOfTask: totalNumberOfTask,
                        });
                    } else {
                        totalUnCompletedTask = 0;
                        totalCompletedTask = 0;
                        totalNumberOfTask = 0;

                        totalNumberOfTask = totalNumberOfTask + 1;
                        totalUnCompletedTask = totalUnCompletedTask + 1;
                        sprintEditPromise = db.collection("Organizations").doc(documentID).collection("Sprints").doc(editedSprintId).set({
                            TotalUnCompletedTask: totalUnCompletedTask,
                            TotalCompletedTask: totalCompletedTask,
                            TotalNumberOfTask: totalNumberOfTask,
                        });
                    }
                    return Promise.resolve(sprintEditPromise);
                });
                promises.push(p2);
            }

            const p3 = db.collection("Organizations").doc(documentID).collection("Tasks").doc(taskId).update({
                Description: description,
                CreationDate: creationDate,
                Priority: priority,
                Difficulty: difficulty,
                Assignee: assignee,
                EstimatedTime: estimatedTime,
                SprintNumber: editedSprintNumber,
                StoryPointNumber: storyPointNumber,
            });
            promises.push(p3);

            comment = comment + changedData;
            Activity.addActivity("EDITED", comment, taskId, date, time);

            Promise.all(promises).then(() => {
                    result = { data: "OK" };
                    console.log("Edited Task Successfully");
                    return response.status(200).send(result);
                })
                .catch((error) => {
                    result = { data: error };
                    console.error("Error Editing Task", error);
                    return response.status(500).send(result);
                });
        });
        return Promise.resolve(editTaskPromise);
    });
});

function createSprintId(sprintNumber) {
    if (sprintNumber === -1) {
        return "Backlog";
    } else if (sprintNumber === -2) {
        return "Deleted";
    } else {
        return ("S" + sprintNumber);
    }
}