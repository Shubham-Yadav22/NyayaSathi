"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FIRData {
  fullName: string
  location: string
  incidentType: string
  dateOfIncident: string
  timeOfIncident: string
  description: string
}

export default function FIRGenerator() {
  const [formData, setFormData] = useState<FIRData>({
    fullName: "",
    location: "",
    incidentType: "",
    dateOfIncident: "",
    timeOfIncident: "",
    description: "",
  })

  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (field: keyof FIRData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGenerateFIR = () => {
    if (Object.values(formData).every((value) => value.trim() !== "")) {
      setShowPreview(true)
      // In a real app, this would generate and download a PDF
      alert("FIR PDF would be generated and downloaded in a real application!")
    } else {
      alert("Please fill in all fields before generating the FIR.")
    }
  }

  const incidentTypes = [
    "Theft",
    "Assault",
    "Fraud",
    "Cybercrime",
    "Property Damage",
    "Missing Person",
    "Traffic Accident",
    "Other",
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">📝 FIR Generator</h1>
        <p className="text-muted-foreground">Generate a First Information Report with all necessary details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">FIR Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Police Station</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter location or police station"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incidentType">Incident Type</Label>
                <Select onValueChange={(value) => handleInputChange("incidentType", value)}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfIncident">Date of Incident</Label>
                  <Input
                    id="dateOfIncident"
                    type="date"
                    value={formData.dateOfIncident}
                    onChange={(e) => handleInputChange("dateOfIncident", e.target.value)}
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeOfIncident">Time of Incident</Label>
                  <Input
                    id="timeOfIncident"
                    type="time"
                    value={formData.timeOfIncident}
                    onChange={(e) => handleInputChange("timeOfIncident", e.target.value)}
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description of the Incident</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the incident..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="rounded-lg min-h-[120px] resize-none"
                />
              </div>

              <Button
                onClick={handleGenerateFIR}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors"
              >
                Generate FIR PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {showPreview && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">FIR Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4 text-center text-foreground">FIRST INFORMATION REPORT</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Name:</span>
                      <span className="text-muted-foreground">{formData.fullName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Location:</span>
                      <span className="text-muted-foreground">{formData.location}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Incident Type:</span>
                      <span className="text-muted-foreground">{formData.incidentType}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Date:</span>
                      <span className="text-muted-foreground">{formData.dateOfIncident}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">Time:</span>
                      <span className="text-muted-foreground">{formData.timeOfIncident}</span>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <span className="font-medium text-foreground">Description:</span>
                      <p className="mt-2 text-muted-foreground leading-relaxed">{formData.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
                    Generated on {new Date().toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!showPreview && (
            <Card className="border-dashed border-2 border-border bg-card">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">📄</div>
                  <p>FIR preview will appear here after filling the form</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
