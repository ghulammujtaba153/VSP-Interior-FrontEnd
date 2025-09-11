"use client";

import { BASE_URL } from "@/configs/url";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ProjectForm = () => {
  const [clients, setClients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [activeSection, setActiveSection] = useState("basic"); // For accordion sections

  // Form state
  const [projectData, setProjectData] = useState({
    name: "",
    location: "",
    description: "",
    status: "planned",
    shopDrawingSubmissionDate: "",
    siteMeasureDate: "",
    installationDate: "",
    machiningDate: "",
    assemblyDate: "",
    deliveryDate: "",
    installPhaseDate: "",
    estimatedHours: "",
    availableHours: "",
    alertStatus: "green",
  });

  const [clientId, setClientId] = useState("");
  const [projectWorkers, setProjectWorkers] = useState([
    { workerId: "", role: "", assignedHours: "", startDate: "", endDate: "" },
  ]);
  const [allocations, setAllocations] = useState([
    { materialId: "", quantityAllocated: "" },
  ]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientRes = await axios.get(`${BASE_URL}/api/client/get`);
        const inventoryRes = await axios.get(`${BASE_URL}/api/inventory/get`);
        const workersRes = await axios.get(`${BASE_URL}/api/workers/get`);

        setClients(clientRes.data.data);
        setInventory(inventoryRes.data.inventory);
        setWorkers(workersRes.data.workers);
      } catch (error) {
        toast.error("Error fetching initial data");
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // Handle project data change
  const handleProjectChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  // Handle worker change
  const handleWorkerChange = (index, field, value) => {
    const updatedWorkers = [...projectWorkers];
    updatedWorkers[index][field] = value;
    setProjectWorkers(updatedWorkers);
  };

  // Handle allocation change
  const handleAllocationChange = (index, field, value) => {
    const updatedAllocations = [...allocations];
    updatedAllocations[index][field] = value;
    setAllocations(updatedAllocations);
  };

  // Add new worker row
  const addWorker = () => {
    setProjectWorkers([
      ...projectWorkers,
      { workerId: "", role: "", assignedHours: "", startDate: "", endDate: "" },
    ]);
  };

  // Remove worker row
  const removeWorker = (index) => {
    if (projectWorkers.length > 1) {
      const updatedWorkers = [...projectWorkers];
      updatedWorkers.splice(index, 1);
      setProjectWorkers(updatedWorkers);
    }
  };

  // Add new allocation row
  const addAllocation = () => {
    setAllocations([...allocations, { materialId: "", quantityAllocated: "" }]);
  };

  // Remove allocation row
  const removeAllocation = (index) => {
    if (allocations.length > 1) {
      const updatedAllocations = [...allocations];
      updatedAllocations.splice(index, 1);
      setAllocations(updatedAllocations);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.loading("Creating project...");
    try {
      const res = await axios.post(`${BASE_URL}/api/projects/create`, {
        projectData,
        clientData: { id: clientId },
        workers: projectWorkers,
        allocations,
      });
      toast.dismiss();
      toast.success("Project created successfully!");
      console.log(res.data);
      
      // Reset form after successful submission
      setProjectData({
        name: "",
        location: "",
        description: "",
        status: "planned",
        shopDrawingSubmissionDate: "",
        siteMeasureDate: "",
        installationDate: "",
        machiningDate: "",
        assemblyDate: "",
        deliveryDate: "",
        installPhaseDate: "",
        estimatedHours: "",
        availableHours: "",
        alertStatus: "green",
      });
      setClientId("");
      setProjectWorkers([
        { workerId: "", role: "", assignedHours: "", startDate: "", endDate: "" },
      ]);
      setAllocations([{ materialId: "", quantityAllocated: "" }]);
    } catch (error) {
      toast.dismiss();
      toast.error("Error creating project");
      console.error(error);
    }
  };

  // Toggle section visibility
  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Create New Project</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="border rounded-lg overflow-hidden">
          <div 
            className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection("basic")}
          >
            <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
            <span>{activeSection === "basic" ? "▼" : "▶"}</span>
          </div>
          
          {activeSection === "basic" && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter project name"
                  value={projectData.name}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter project location"
                  value={projectData.location}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter project description"
                  value={projectData.description}
                  onChange={handleProjectChange}
                  rows={3}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={projectData.status}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Workers Section */}
        <div className="border rounded-lg overflow-hidden">
          <div 
            className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection("workers")}
          >
            <h3 className="text-lg font-semibold text-gray-700">Assign Workers</h3>
            <span>{activeSection === "workers" ? "▼" : "▶"}</span>
          </div>
          
          {activeSection === "workers" && (
            <div className="p-4">
              {projectWorkers.map((worker, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Worker #{index + 1}</h4>
                    {projectWorkers.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeWorker(index)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-600">Worker *</label>
                      <select
                        value={worker.workerId}
                        onChange={(e) =>
                          handleWorkerChange(index, "workerId", e.target.value)
                        }
                        className="border p-2 w-full rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Worker</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-600">Role</label>
                      <input
                        type="text"
                        placeholder="Role"
                        value={worker.role}
                        onChange={(e) =>
                          handleWorkerChange(index, "role", e.target.value)
                        }
                        className="border p-2 w-full rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-600">Hours</label>
                      <input
                        type="number"
                        placeholder="Assigned Hours"
                        value={worker.assignedHours}
                        onChange={(e) =>
                          handleWorkerChange(index, "assignedHours", e.target.value)
                        }
                        className="border p-2 w-full rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        min={0}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-600">Start Date</label>
                      <input
                        type="date"
                        value={worker.startDate}
                        onChange={(e) =>
                          handleWorkerChange(index, "startDate", e.target.value)
                        }
                        className="border p-2 w-full rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-600">End Date</label>
                      <input
                        type="date"
                        value={worker.endDate}
                        onChange={(e) =>
                          handleWorkerChange(index, "endDate", e.target.value)
                        }
                        className="border p-2 w-full rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addWorker}
                className="flex items-center text-blue-600 mt-2 text-sm font-medium"
              >
                <span className="mr-1">+</span> Add Another Worker
              </button>
            </div>
          )}
        </div>

        {/* Inventory Section */}
        <div className="border rounded-lg overflow-hidden">
          <div 
            className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection("inventory")}
          >
            <h3 className="text-lg font-semibold text-gray-700">Inventory Allocation</h3>
            <span>{activeSection === "inventory" ? "▼" : "▶"}</span>
          </div>
          
          {activeSection === "inventory" && (
            <div className="p-4">
              {allocations.map((allocation, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Allocation #{index + 1}</h4>
                    {allocations.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeAllocation(index)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-600">Material *</label>
                      <select
                        value={allocation.materialId}
                        onChange={(e) =>
                          handleAllocationChange(index, "materialId", e.target.value)
                        }
                        className="border p-2 w-full rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Material</option>
                        {inventory.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm text-gray-600">Quantity *</label>
                      <input
                        type="number"
                        placeholder="Quantity Allocated"
                        value={allocation.quantityAllocated}
                        onChange={(e) =>
                          handleAllocationChange(index, "quantityAllocated", e.target.value)
                        }
                        className="border p-2 w-full rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        min={0}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addAllocation}
                className="flex items-center text-blue-600 mt-2 text-sm font-medium"
              >
                <span className="mr-1">+</span> Add Another Allocation
              </button>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="border rounded-lg overflow-hidden">
          <div 
            className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection("timeline")}
          >
            <h3 className="text-lg font-semibold text-gray-700">Project Timeline</h3>
            <span>{activeSection === "timeline" ? "▼" : "▶"}</span>
          </div>
          
          {activeSection === "timeline" && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Shop Drawing Submission Date</label>
                <input
                  type="date"
                  name="shopDrawingSubmissionDate"
                  value={projectData.shopDrawingSubmissionDate}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Site Measure Date</label>
                <input
                  type="date"
                  name="siteMeasureDate"
                  value={projectData.siteMeasureDate}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Installation Date</label>
                <input
                  type="date"
                  name="installationDate"
                  value={projectData.installationDate}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Machining Date</label>
                <input
                  type="date"
                  name="machiningDate"
                  value={projectData.machiningDate}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Assembly Date</label>
                <input
                  type="date"
                  name="assemblyDate"
                  value={projectData.assemblyDate}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={projectData.deliveryDate}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Install Phase Date</label>
                <input
                  type="date"
                  name="installPhaseDate"
                  value={projectData.installPhaseDate}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Resource Management Section */}
        <div className="border rounded-lg overflow-hidden">
          <div 
            className="bg-gray-50 p-4 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection("resources")}
          >
            <h3 className="text-lg font-semibold text-gray-700">Resource Management</h3>
            <span>{activeSection === "resources" ? "▼" : "▶"}</span>
          </div>
          
          {activeSection === "resources" && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Estimated Hours</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={projectData.estimatedHours}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Available Hours</label>
                <input
                  type="number"
                  name="availableHours"
                  value={projectData.availableHours}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Alert Status</label>
                <select
                  name="alertStatus"
                  value={projectData.alertStatus}
                  onChange={handleProjectChange}
                  className="border p-2 w-full rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="green">Green (On Track)</option>
                  <option value="yellow">Yellow (Attention)</option>
                  <option value="red">Red (Critical)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;