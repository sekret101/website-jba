"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus, Play, Pause } from "lucide-react"
import { useSiteContext } from "@/contexts/site-context"

export default function BettingManagement() {
  const { bettingOptions, setBettingOptions, liveStreams, setLiveStreams } = useSiteContext()
  const [editOption, setEditOption] = useState<any>(null)
  const [newOption, setNewOption] = useState({
    title: "",
    description: "",
    option1: "",
    option2: "",
    odds1: "",
    odds2: "",
    active: true,
    liveStream: false,
  })
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleEditOption = (option: any) => {
    setEditOption({ ...option })
    setEditDialogOpen(true)
  }

  const handleUpdateOption = () => {
    if (!editOption) return

    const updatedOptions = bettingOptions.map((option) => (option.id === editOption.id ? editOption : option))

    setBettingOptions(updatedOptions)
    setEditDialogOpen(false)

    toast({
      title: "Betting option updated",
      description: "The betting option has been updated successfully.",
    })
  }

  const handleDeleteOption = (id: number) => {
    if (confirm("Are you sure you want to delete this betting option?")) {
      const updatedOptions = bettingOptions.filter((option) => option.id !== id)
      setBettingOptions(updatedOptions)

      toast({
        title: "Betting option deleted",
        description: "The betting option has been deleted successfully.",
      })
    }
  }

  const handleAddOption = () => {
    const newId = bettingOptions.length > 0 ? Math.max(...bettingOptions.map((o) => o.id)) + 1 : 1

    setBettingOptions([
      ...bettingOptions,
      {
        id: newId,
        ...newOption,
      },
    ])

    // If live stream is enabled, add a corresponding live stream
    if (newOption.liveStream) {
      const streamId = liveStreams.length > 0 ? Math.max(...liveStreams.map((s) => s.id)) + 1 : 1

      setLiveStreams([
        ...liveStreams,
        {
          id: streamId,
          name: newOption.title,
          url: `https://example.com/stream${streamId}`,
          status: "live",
          viewers: Math.floor(Math.random() * 1000) + 100,
          quality: "720p",
        },
      ])
    }

    setNewDialogOpen(false)
    setNewOption({
      title: "",
      description: "",
      option1: "",
      option2: "",
      odds1: "",
      odds2: "",
      active: true,
      liveStream: false,
    })

    toast({
      title: "Betting option added",
      description: "The new betting option has been added successfully.",
    })
  }

  const toggleOptionStatus = (id: number) => {
    const updatedOptions = bettingOptions.map((option) =>
      option.id === id ? { ...option, active: !option.active } : option,
    )

    setBettingOptions(updatedOptions)

    toast({
      title: "Status updated",
      description: `Betting option is now ${updatedOptions.find((o) => o.id === id)?.active ? "active" : "inactive"}.`,
    })
  }

  const toggleLiveStream = (id: number) => {
    const option = bettingOptions.find((o) => o.id === id)
    if (!option) return

    const updatedOptions = bettingOptions.map((option) =>
      option.id === id ? { ...option, liveStream: !option.liveStream } : option,
    )

    setBettingOptions(updatedOptions)

    // Update live streams accordingly
    if (!option.liveStream) {
      // Add a new live stream
      const streamId = liveStreams.length > 0 ? Math.max(...liveStreams.map((s) => s.id)) + 1 : 1

      setLiveStreams([
        ...liveStreams,
        {
          id: streamId,
          name: option.title,
          url: `https://example.com/stream${streamId}`,
          status: "live",
          viewers: Math.floor(Math.random() * 1000) + 100,
          quality: "720p",
        },
      ])
    } else {
      // Remove the live stream
      const updatedStreams = liveStreams.filter((stream) => stream.name !== option.title)
      setLiveStreams(updatedStreams)
    }

    toast({
      title: "Live stream updated",
      description: `Live stream is now ${!option.liveStream ? "enabled" : "disabled"}.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Betting Options Management</h1>
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Betting Option
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Betting Option</DialogTitle>
              <DialogDescription>Create a new betting option for your users.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-title">Title</Label>
                  <Input
                    id="new-title"
                    value={newOption.title}
                    onChange={(e) => setNewOption({ ...newOption, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Input
                    id="new-description"
                    value={newOption.description}
                    onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-option1">Option 1</Label>
                  <Input
                    id="new-option1"
                    value={newOption.option1}
                    onChange={(e) => setNewOption({ ...newOption, option1: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-odds1">Odds 1</Label>
                  <Input
                    id="new-odds1"
                    value={newOption.odds1}
                    onChange={(e) => setNewOption({ ...newOption, odds1: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-option2">Option 2</Label>
                  <Input
                    id="new-option2"
                    value={newOption.option2}
                    onChange={(e) => setNewOption({ ...newOption, option2: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-odds2">Odds 2</Label>
                  <Input
                    id="new-odds2"
                    value={newOption.odds2}
                    onChange={(e) => setNewOption({ ...newOption, odds2: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new-active"
                    checked={newOption.active}
                    onCheckedChange={(checked) => setNewOption({ ...newOption, active: checked })}
                  />
                  <Label htmlFor="new-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new-live-stream"
                    checked={newOption.liveStream}
                    onCheckedChange={(checked) => setNewOption({ ...newOption, liveStream: checked })}
                  />
                  <Label htmlFor="new-live-stream">Enable Live Stream</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleAddOption}>
                Add Betting Option
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Options</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Options</TabsTrigger>
          <TabsTrigger value="all">All Options</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Betting Options</CardTitle>
              <CardDescription>Manage your currently active betting options.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Live Stream</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bettingOptions
                    .filter((option) => option.active)
                    .map((option) => (
                      <TableRow key={option.id}>
                        <TableCell>
                          <div className="font-medium">{option.title}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </TableCell>
                        <TableCell>
                          <div>{option.option1}</div>
                          <div>{option.option2}</div>
                        </TableCell>
                        <TableCell>
                          <div>{option.odds1}</div>
                          <div>{option.odds2}</div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toggleLiveStream(option.id)}>
                            {option.liveStream ? (
                              <Play className="h-4 w-4 text-green-500" />
                            ) : (
                              <Pause className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="ml-2">{option.liveStream ? "Enabled" : "Disabled"}</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditOption(option)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => toggleOptionStatus(option.id)}>
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteOption(option.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {bettingOptions.filter((option) => option.active).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No active betting options available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Betting Options</CardTitle>
              <CardDescription>Manage your currently inactive betting options.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Live Stream</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bettingOptions
                    .filter((option) => !option.active)
                    .map((option) => (
                      <TableRow key={option.id}>
                        <TableCell>
                          <div className="font-medium">{option.title}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </TableCell>
                        <TableCell>
                          <div>{option.option1}</div>
                          <div>{option.option2}</div>
                        </TableCell>
                        <TableCell>
                          <div>{option.odds1}</div>
                          <div>{option.odds2}</div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => toggleLiveStream(option.id)}>
                            {option.liveStream ? (
                              <Play className="h-4 w-4 text-green-500" />
                            ) : (
                              <Pause className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="ml-2">{option.liveStream ? "Enabled" : "Disabled"}</span>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditOption(option)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => toggleOptionStatus(option.id)}>
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteOption(option.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {bettingOptions.filter((option) => !option.active).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No inactive betting options available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Betting Options</CardTitle>
              <CardDescription>View and manage all betting options.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Live Stream</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bettingOptions.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell>
                        <div className="font-medium">{option.title}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </TableCell>
                      <TableCell>
                        <div>{option.option1}</div>
                        <div>{option.option2}</div>
                      </TableCell>
                      <TableCell>
                        <div>{option.odds1}</div>
                        <div>{option.odds2}</div>
                      </TableCell>
                      <TableCell>
                        <div className={option.active ? "text-green-500" : "text-red-500"}>
                          {option.active ? "Active" : "Inactive"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleLiveStream(option.id)}>
                          {option.liveStream ? (
                            <Play className="h-4 w-4 text-green-500" />
                          ) : (
                            <Pause className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="ml-2">{option.liveStream ? "Enabled" : "Disabled"}</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditOption(option)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleOptionStatus(option.id)}>
                            {option.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteOption(option.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {bettingOptions.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No betting options available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Betting Option</DialogTitle>
            <DialogDescription>Make changes to the betting option.</DialogDescription>
          </DialogHeader>
          {editOption && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editOption.title}
                    onChange={(e) => setEditOption({ ...editOption, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editOption.description}
                    onChange={(e) => setEditOption({ ...editOption, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-option1">Option 1</Label>
                  <Input
                    id="edit-option1"
                    value={editOption.option1}
                    onChange={(e) => setEditOption({ ...editOption, option1: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-odds1">Odds 1</Label>
                  <Input
                    id="edit-odds1"
                    value={editOption.odds1}
                    onChange={(e) => setEditOption({ ...editOption, odds1: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-option2">Option 2</Label>
                  <Input
                    id="edit-option2"
                    value={editOption.option2}
                    onChange={(e) => setEditOption({ ...editOption, option2: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-odds2">Odds 2</Label>
                  <Input
                    id="edit-odds2"
                    value={editOption.odds2}
                    onChange={(e) => setEditOption({ ...editOption, odds2: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={editOption.active}
                    onCheckedChange={(checked) => setEditOption({ ...editOption, active: checked })}
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-live-stream"
                    checked={editOption.liveStream}
                    onCheckedChange={(checked) => setEditOption({ ...editOption, liveStream: checked })}
                  />
                  <Label htmlFor="edit-live-stream">Enable Live Stream</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateOption}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

