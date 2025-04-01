"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Play, Pause, Upload, Video, RefreshCw, Smartphone } from "lucide-react"
import { useSiteContext } from "@/contexts/site-context"
import { RadioGroupItem } from "@/components/ui/radio-group"

export default function LiveVideoManagement() {
  const { liveStreams, setLiveStreams, bettingOptions, setBettingOptions } = useSiteContext()
  const [newStream, setNewStream] = useState({
    name: "",
    url: "",
    quality: "720p",
    status: "scheduled",
    scheduledTime: "",
  })
  const { toast } = useToast()

  const handleAddStream = (e: React.FormEvent) => {
    e.preventDefault()

    const newId = liveStreams.length > 0 ? Math.max(...liveStreams.map((s) => s.id)) + 1 : 1

    setLiveStreams([
      ...liveStreams,
      {
        id: newId,
        ...newStream,
        viewers: 0,
      },
    ])

    // If this stream matches a betting option title, update the liveStream property
    const matchingOption = bettingOptions.find((option) => option.title === newStream.name)
    if (matchingOption) {
      const updatedOptions = bettingOptions.map((option) =>
        option.title === newStream.name ? { ...option, liveStream: true } : option,
      )
      setBettingOptions(updatedOptions)
    }

    setNewStream({
      name: "",
      url: "",
      quality: "720p",
      status: "scheduled",
      scheduledTime: "",
    })

    toast({
      title: "Stream added",
      description: "The new live stream has been added successfully.",
    })
  }

  const toggleStreamStatus = (id: number) => {
    const updatedStreams = liveStreams.map((stream) => {
      if (stream.id === id) {
        const newStatus = stream.status === "live" ? "paused" : "live"
        return { ...stream, status: newStatus }
      }
      return stream
    })

    setLiveStreams(updatedStreams)

    const stream = updatedStreams.find((s) => s.id === id)
    toast({
      title: "Stream status updated",
      description: `Stream is now ${stream?.status}.`,
    })
  }

  const startMobileStream = () => {
    const newId = liveStreams.length > 0 ? Math.max(...liveStreams.map((s) => s.id)) + 1 : 1

    // Find a betting option to associate with
    const availableOption = bettingOptions.find((option) => option.active && !option.liveStream)

    if (!availableOption) {
      toast({
        title: "No available betting options",
        description: "Please create an active betting option first.",
        variant: "destructive",
      })
      return
    }

    // Create new stream
    const newStream = {
      id: newId,
      name: availableOption.title,
      url: "",
      status: "live",
      viewers: Math.floor(Math.random() * 100) + 10,
      quality: "720p",
    }

    setLiveStreams([...liveStreams, newStream])

    // Update betting option
    const updatedOptions = bettingOptions.map((option) =>
      option.id === availableOption.id ? { ...option, liveStream: true } : option,
    )
    setBettingOptions(updatedOptions)

    toast({
      title: "Mobile stream started",
      description: `Live stream for ${availableOption.title} has started. Open the site on your mobile device to view.`,
    })
  }

  const deleteStream = (id: number) => {
    if (confirm("Are you sure you want to delete this stream?")) {
      const streamToDelete = liveStreams.find((s) => s.id === id)
      const updatedStreams = liveStreams.filter((stream) => stream.id !== id)
      setLiveStreams(updatedStreams)

      // If this stream matches a betting option title, update the liveStream property
      if (streamToDelete) {
        const updatedOptions = bettingOptions.map((option) =>
          option.title === streamToDelete.name ? { ...option, liveStream: false } : option,
        )
        setBettingOptions(updatedOptions)
      }

      toast({
        title: "Stream deleted",
        description: "The live stream has been deleted successfully.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Live Video Management</h1>
        <Button onClick={startMobileStream} className="bg-primary text-white">
          <Smartphone className="mr-2 h-4 w-4" />
          Start Mobile Stream Now
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Streams</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="all">All Streams</TabsTrigger>
          <TabsTrigger value="add">Add New Stream</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Live Streams</CardTitle>
              <CardDescription>Manage your currently active live streams.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {liveStreams
                  .filter((stream) => stream.status === "live")
                  .map((stream) => (
                    <Card key={stream.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>{stream.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium">Live</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                          <div className="text-center">
                            <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Live Stream Preview</p>
                            {!stream.url && (
                              <div className="mt-2 p-2 bg-blue-50 rounded-md text-blue-800 text-sm">
                                <Smartphone className="h-4 w-4 inline mr-1" />
                                Mobile streaming active
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {stream.url ? (
                            <div>
                              <p className="font-medium">Stream URL</p>
                              <p className="text-muted-foreground truncate">{stream.url}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">Stream Source</p>
                              <p className="text-muted-foreground flex items-center">
                                <Smartphone className="h-4 w-4 mr-1" /> Mobile Camera
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">Quality</p>
                            <p className="text-muted-foreground">{stream.quality}</p>
                          </div>
                          <div>
                            <p className="font-medium">Current Viewers</p>
                            <p className="text-muted-foreground">{stream.viewers}</p>
                          </div>
                          <div>
                            <p className="font-medium">Status</p>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span>Live</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => toggleStreamStatus(stream.id)}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause Stream
                        </Button>
                        <Button variant="destructive" onClick={() => deleteStream(stream.id)}>
                          End Stream
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                {liveStreams.filter((stream) => stream.status === "live").length === 0 && (
                  <div className="text-center py-10">
                    <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No Active Streams</h3>
                    <p className="text-muted-foreground">
                      Start a new stream using your mobile device or external URL.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Streams</CardTitle>
              <CardDescription>Manage your scheduled live streams.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {liveStreams
                  .filter((stream) => stream.status === "scheduled")
                  .map((stream) => (
                    <Card key={stream.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>{stream.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                            <span className="text-sm font-medium">Scheduled</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Stream URL</p>
                            <p className="text-muted-foreground truncate">{stream.url}</p>
                          </div>
                          <div>
                            <p className="font-medium">Quality</p>
                            <p className="text-muted-foreground">{stream.quality}</p>
                          </div>
                          <div>
                            <p className="font-medium">Scheduled Time</p>
                            <p className="text-muted-foreground">
                              {new Date(stream.scheduledTime || "").toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Status</p>
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                              <span>Scheduled</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => toggleStreamStatus(stream.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Stream
                        </Button>
                        <Button variant="destructive" onClick={() => deleteStream(stream.id)}>
                          Cancel Stream
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}

                {liveStreams.filter((stream) => stream.status === "scheduled").length === 0 && (
                  <div className="text-center py-10">
                    <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No Scheduled Streams</h3>
                    <p className="text-muted-foreground">There are no scheduled streams at the moment.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Streams</CardTitle>
              <CardDescription>View and manage all live streams.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {liveStreams.map((stream) => (
                  <Card key={stream.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>{stream.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          {stream.status === "live" && (
                            <>
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium">Live</span>
                            </>
                          )}
                          {stream.status === "scheduled" && (
                            <>
                              <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                              <span className="text-sm font-medium">Scheduled</span>
                            </>
                          )}
                          {stream.status === "ended" && (
                            <>
                              <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                              <span className="text-sm font-medium">Ended</span>
                            </>
                          )}
                          {stream.status === "paused" && (
                            <>
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              <span className="text-sm font-medium">Paused</span>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Stream URL</p>
                          <p className="text-muted-foreground truncate">{stream.url}</p>
                        </div>
                        <div>
                          <p className="font-medium">Quality</p>
                          <p className="text-muted-foreground">{stream.quality}</p>
                        </div>
                        {stream.status === "scheduled" ? (
                          <div>
                            <p className="font-medium">Scheduled Time</p>
                            <p className="text-muted-foreground">
                              {new Date(stream.scheduledTime || "").toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">Viewers</p>
                            <p className="text-muted-foreground">{stream.viewers || 0}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {stream.status === "live" && (
                        <Button variant="outline" onClick={() => toggleStreamStatus(stream.id)}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause Stream
                        </Button>
                      )}
                      {stream.status === "paused" && (
                        <Button variant="outline" onClick={() => toggleStreamStatus(stream.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Resume Stream
                        </Button>
                      )}
                      {stream.status === "scheduled" && (
                        <Button variant="outline" onClick={() => toggleStreamStatus(stream.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Start Stream
                        </Button>
                      )}
                      {stream.status === "ended" && (
                        <Button variant="outline" disabled>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Restart Stream
                        </Button>
                      )}
                      <Button variant="destructive" onClick={() => deleteStream(stream.id)}>
                        {stream.status === "ended" ? "Delete" : "End Stream"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                {liveStreams.length === 0 && (
                  <div className="text-center py-10">
                    <Video className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No Streams</h3>
                    <p className="text-muted-foreground">There are no streams available.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Stream</CardTitle>
              <CardDescription>Create a new live stream for your betting events.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStream}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="stream-name">Stream Name</Label>
                    <Select
                      value={newStream.name}
                      onValueChange={(value) => setNewStream({ ...newStream, name: value })}
                    >
                      <SelectTrigger id="stream-name">
                        <SelectValue placeholder="Select event or enter custom name" />
                      </SelectTrigger>
                      <SelectContent>
                        {bettingOptions.map((option) => (
                          <SelectItem key={option.id} value={option.title}>
                            {option.title}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Event Name</SelectItem>
                      </SelectContent>
                    </Select>
                    {newStream.name === "custom" && (
                      <Input
                        placeholder="Enter custom event name"
                        className="mt-2"
                        onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
                      />
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>Stream Source</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <RadioGroupItem value="mobile" id="mobile" className="peer sr-only" checked />
                        <Label
                          htmlFor="mobile"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-primary bg-popover p-4"
                        >
                          <Smartphone className="mb-3 h-6 w-6" />
                          Mobile Camera
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="url" id="url" className="peer sr-only" />
                        <Label
                          htmlFor="url"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground"
                        >
                          <Video className="mb-3 h-6 w-6" />
                          External URL
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="stream-url">Stream URL (for external sources)</Label>
                    <Input
                      id="stream-url"
                      value={newStream.url}
                      onChange={(e) => setNewStream({ ...newStream, url: e.target.value })}
                      placeholder="Leave empty for mobile streaming"
                    />
                    <p className="text-xs text-muted-foreground">
                      For mobile streaming, you'll receive a unique link to open on your phone
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="stream-quality">Quality</Label>
                      <Select
                        value={newStream.quality}
                        onValueChange={(value) => setNewStream({ ...newStream, quality: value })}
                      >
                        <SelectTrigger id="stream-quality">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="480p">480p</SelectItem>
                          <SelectItem value="720p">720p (recommended)</SelectItem>
                          <SelectItem value="1080p">1080p (high data usage)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stream-status">Status</Label>
                      <Select
                        value={newStream.status}
                        onValueChange={(value) => setNewStream({ ...newStream, status: value })}
                      >
                        <SelectTrigger id="stream-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="live">Live Now</SelectItem>
                          <SelectItem value="scheduled">Schedule for Later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newStream.status === "scheduled" && (
                    <div className="grid gap-2">
                      <Label htmlFor="scheduled-time">Scheduled Time</Label>
                      <Input
                        id="scheduled-time"
                        type="datetime-local"
                        value={newStream.scheduledTime}
                        onChange={(e) => setNewStream({ ...newStream, scheduledTime: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <Button type="submit">
                      <Upload className="mr-2 h-4 w-4" />
                      {newStream.status === "live" ? "Start Stream" : "Schedule Stream"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

