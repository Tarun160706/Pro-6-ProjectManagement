const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

// GET all projects (ordered)
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST – add new project at end
router.post("/", async (req, res) => {
  try {
    const { projectName, columns } = req.body;
    const count = await Project.countDocuments();
    const project = new Project({
      projectName: projectName || "",
      columns: columns || {},
      order: count,
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST – insert row at specific index
router.post("/insert", async (req, res) => {
  try {
    const { afterIndex, projectName, columns } = req.body;
    const insertOrder = afterIndex + 1;
    await Project.updateMany(
      { order: { $gte: insertOrder } },
      { $inc: { order: 1 } }
    );
    const project = new Project({
      projectName: projectName || "",
      columns: columns || {},
      order: insertOrder,
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT – update a project
router.put("/:id", async (req, res) => {
  try {
    const { projectName, columns, questionnaireId } = req.body;
    const updateFields = {};
    if (projectName !== undefined) updateFields.projectName = projectName;
    if (columns !== undefined) updateFields.columns = columns;
    if (questionnaireId !== undefined) updateFields.questionnaireId = questionnaireId;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: false }
    );
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH – update single cell
router.patch("/:id/cell", async (req, res) => {
  try {
    const { col, value } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Not found" });

    if (col === "projectName") {
      project.projectName = value;
    } else {
      project.columns[col] = value;
      project.markModified("columns");
    }
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE all – must be before /:id
router.delete("/all", async (req, res) => {
  try {
    await Project.deleteMany({});
    res.json({ message: "All projects deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE single project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Version management ──────────────────────────────────────────

// POST /:id/versions – add a version to a project
router.post("/:id/versions", async (req, res) => {
  try {
    const { versionName, questionnaireId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Not found" });

    project.versions.push({
      versionName: versionName || "",
      questionnaireId: questionnaireId || "",
    });
    project.versions.sort((a, b) => compareVersions(a.versionName, b.versionName));
    project.markModified("versions");
    await project.save();

    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /:id/versions/:versionId – remove a version from a project
router.delete("/:id/versions/:versionId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Not found" });

    project.versions = project.versions.filter(
      (v) => v._id.toString() !== req.params.versionId
    );
    project.markModified("versions");
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/versions/:versionId – update a version name and/or questionnaireId
router.put("/:id/versions/:versionId", async (req, res) => {
  try {
    const { versionName, questionnaireId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Not found" });

    const version = project.versions.id(req.params.versionId);
    if (!version) return res.status(404).json({ error: "Version not found" });

    if (versionName !== undefined) version.versionName = versionName;
    if (questionnaireId !== undefined) version.questionnaireId = questionnaireId;
    project.versions.sort((a, b) => compareVersions(a.versionName, b.versionName));
    project.markModified("versions");
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper to post JSON to another service
function postJson(url, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(body);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (e) => { reject(e); });
    req.write(postData);
    req.end();
  });
}

function parseVersion(vStr) {
  const parts = [];
  const regex = /(\d+|\D+)/g;
  let match;
  while ((match = regex.exec(vStr)) !== null) {
    const part = match[0];
    if (/^\d+$/.test(part)) {
      parts.push({ type: 'number', val: parseInt(part, 10), original: part });
    } else {
      parts.push({ type: 'string', val: part });
    }
  }
  return parts;
}

function getNextVersionName(existingNames, srcName) {
  let candidate;
  if (!srcName.includes('.')) {
    candidate = srcName + ".1";
  } else {
    const lastDotIdx = srcName.lastIndexOf('.');
    const prefix = srcName.substring(0, lastDotIdx + 1);
    const lastPart = srcName.substring(lastDotIdx + 1);
    const lastNum = parseInt(lastPart, 10);
    if (isNaN(lastNum)) {
      candidate = srcName + ".1";
    } else {
      candidate = prefix + (lastNum + 1);
    }
  }

  let finalName = candidate;
  let lastDotIdx = finalName.lastIndexOf('.');
  const prefix = finalName.substring(0, lastDotIdx + 1);
  const lastPart = finalName.substring(lastDotIdx + 1);
  let counter = parseInt(lastPart, 10) || 1;

  while (existingNames.includes(finalName)) {
    counter++;
    finalName = prefix + counter;
  }
  return finalName;
}

function compareVersions(a, b) {
  const regex = /(\d+|\D+)/g;
  const partsA = (a || "").match(regex) || [];
  const partsB = (b || "").match(regex) || [];
  
  const maxLen = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < maxLen; i++) {
    const partA = partsA[i];
    const partB = partsB[i];
    
    if (partA === undefined) return -1;
    if (partB === undefined) return 1;
    
    const isNumA = /^\d+$/.test(partA);
    const isNumB = /^\d+$/.test(partB);
    
    if (isNumA && isNumB) {
      const numA = parseInt(partA, 10);
      const numB = parseInt(partB, 10);
      if (numA !== numB) {
        return numA - numB;
      }
    } else if (partA !== partB) {
      return partA.localeCompare(partB);
    }
  }
  return 0;
}

async function copyMongoGridData(projectName, oldVersion, newVersion) {
  try {
    const techConn = mongoose.createConnection("mongodb://localhost:27017/tech_stack_db");
    await new Promise(resolve => techConn.once('open', resolve));
    const dynamicGridsCollection = techConn.collection("dynamicgrids");
    const techOldName = `Technical Stack - ${projectName}/${oldVersion}`;
    const techNewName = `Technical Stack - ${projectName}/${newVersion}`;
    const techDocs = await dynamicGridsCollection.find({ gridName: techOldName }).toArray();
    if (techDocs.length > 0) {
      const techNewDocs = techDocs.map(doc => {
        const { _id, ...rest } = doc;
        return {
          ...rest,
          gridName: techNewName,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });
      await dynamicGridsCollection.insertMany(techNewDocs);
    }
    await techConn.close();
  } catch (e) {
    console.error("Error copying Technical Stack data:", e.message);
  }

  try {
    const queriesConn = mongoose.createConnection("mongodb://localhost:27017/queries_responses_db");
    await new Promise(resolve => queriesConn.once('open', resolve));
    const gridsCollection = queriesConn.collection("grids");
    const gridrowsCollection = queriesConn.collection("gridrows");
    
    const oldGridName = `Queries & Responses - ${projectName}/${oldVersion}`;
    const newGridName = `Queries & Responses - ${projectName}/${newVersion}`;
    
    const sourceGrid = await gridsCollection.findOne({ name: oldGridName });
    if (sourceGrid) {
      const { _id: oldGridId, ...gridRest } = sourceGrid;
      const newGridId = new mongoose.Types.ObjectId();
      
      await gridsCollection.insertOne({
        _id: newGridId,
        ...gridRest,
        name: newGridName,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const rows = await gridrowsCollection.find({ gridId: oldGridId }).toArray();
      if (rows.length > 0) {
        const newRows = rows.map(row => {
          const { _id, ...rowRest } = row;
          return {
            ...rowRest,
            gridId: newGridId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        });
        await gridrowsCollection.insertMany(newRows);
      }
    }
    await queriesConn.close();
  } catch (e) {
    console.error("Error copying Queries & Responses data:", e.message);
  }

  try {
    const resourceConn = mongoose.createConnection("mongodb://localhost:27017/resource_grid");
    await new Promise(resolve => resourceConn.once('open', resolve));
    const resourcesCollection = resourceConn.collection("resources");
    
    const resourceDocs = await resourcesCollection.find({ projectName, version: oldVersion }).toArray();
    if (resourceDocs.length > 0) {
      const newResourceDocs = resourceDocs.map(doc => {
        const { _id, ...rest } = doc;
        return {
          ...rest,
          version: newVersion,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });
      await resourcesCollection.insertMany(newResourceDocs);
    }
    await resourceConn.close();
  } catch (e) {
    console.error("Error copying Resource Grid data:", e.message);
  }
}

function copyJsonGridData(projectName, oldVersion, newVersion) {
  const jsonGrids = [
    'assumption-grid',
    'dependency-grid',
    'features-grid',
    'streams-grid',
    'out-of-scope-grid',
    'milestone-grid'
  ];

  for (const gridDir of jsonGrids) {
    try {
      const filePath = path.join(__dirname, '..', '..', '..', gridDir, 'data.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        const oldEntries = data.filter(item => item.projectName === projectName && item.version === oldVersion);
        if (oldEntries.length > 0) {
          const newEntries = oldEntries.map(item => {
            const { _id, ...rest } = item;
            return {
              _id: crypto.randomUUID(),
              ...rest,
              version: newVersion,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          });
          data.push(...newEntries);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
          console.log(`Copied ${newEntries.length} entries for ${gridDir}`);
        }
      }
    } catch (err) {
      console.error(`Error copying JSON grid data for ${gridDir}:`, err.message);
    }
  }
}

// POST /:id/versions/:versionId/copy – copy a version (clones grids & questionnaire)
router.post("/:id/versions/:versionId/copy", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const sourceVersion = project.versions.id(req.params.versionId);
    if (!sourceVersion) return res.status(404).json({ error: "Source version not found" });

    // 1. Calculate next available version name
    const existingVersionNames = project.versions.map(v => v.versionName);
    const newVersionName = getNextVersionName(existingVersionNames, sourceVersion.versionName);

    // 2. Clone questionnaire if it exists
    let newQuestionnaireId = "";
    if (sourceVersion.questionnaireId) {
      try {
        const qaResult = await postJson(`http://localhost:5010/api/v1/questionnaires/${sourceVersion.questionnaireId}/copy`, {
          title: project.projectName.trim()
        });
        newQuestionnaireId = qaResult?.questionnaireId || "";
      } catch (err) {
        console.error("Failed to copy questionnaire, trying fallback creation:", err.message);
        try {
          const fallbackResult = await postJson(`http://localhost:5010/api/v1/questionnaires`, {
            title: project.projectName.trim()
          });
          newQuestionnaireId = fallbackResult?.questionnaireId || "";
        } catch (e) {
          console.error("Fallback questionnaire creation failed:", e.message);
        }
      }
    } else {
      try {
        const result = await postJson(`http://localhost:5010/api/v1/questionnaires`, {
          title: project.projectName.trim()
        });
        newQuestionnaireId = result?.questionnaireId || "";
      } catch (err) {
        console.error("Failed to create blank questionnaire:", err.message);
      }
    }

    // 3. Add copy version metadata to project
    const newVersion = {
      versionName: newVersionName,
      questionnaireId: newQuestionnaireId,
      copiedFrom: sourceVersion.versionName
    };
    project.versions.push(newVersion);
    project.versions.sort((a, b) => compareVersions(a.versionName, b.versionName));
    project.markModified("versions");
    await project.save();

    // 4. Duplicate database grid items asynchronously
    await copyMongoGridData(project.projectName, sourceVersion.versionName, newVersionName);

    // 5. Duplicate JSON file grid items
    copyJsonGridData(project.projectName, sourceVersion.versionName, newVersionName);

    res.status(201).json(project);
  } catch (err) {
    console.error("Error copying version:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;