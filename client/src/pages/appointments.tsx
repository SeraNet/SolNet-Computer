import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Plus, Clock, User, Phone, Mail, Edit, Check, X } from "lucide-react";

const appointmentSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
  serviceType: z.string().min(1, "Service type is required"),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

const statusOptions = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800" },
  { value: "in_progress", label: "In Progress", color: "bg-orange-100 text-orange-800" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function Appointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      appointmentDate: selectedDate,
      appointmentTime: "",
      serviceType: "",
      notes: "",
    },
  });

  const editForm = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["/api/service-types"],
  });

  const addAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentForm) => {
      return apiRequest("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          status: "scheduled",
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsAddModalOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/appointments/${selectedAppointment.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment status updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments.filter((apt: any) => 
    apt.appointmentDate === selectedDate
  );

  const onAddSubmit = (data: AppointmentForm) => {
    addAppointmentMutation.mutate(data);
  };

  const onEditSubmit = (data: AppointmentForm) => {
    updateAppointmentMutation.mutate(data);
  };

  const openEditModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    editForm.reset({
      customerName: appointment.customerName || "",
      customerPhone: appointment.customerPhone || "",
      customerEmail: appointment.customerEmail || "",
      appointmentDate: appointment.appointmentDate || "",
      appointmentTime: appointment.appointmentTime || "",
      serviceType: appointment.serviceType || "",
      notes: appointment.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getBookedTimes = () => {
    return filteredAppointments
      .filter((apt: any) => apt.status !== 'cancelled')
      .map((apt: any) => apt.appointmentTime);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-600">Schedule and manage customer appointments</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem 
                                key={time} 
                                value={time}
                                disabled={getBookedTimes().includes(time)}
                              >
                                {time} {getBookedTimes().includes(time) ? "(Booked)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypes.map((service: any) => (
                            <SelectItem key={service.id} value={service.name}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addAppointmentMutation.isPending}>
                    {addAppointmentMutation.isPending ? "Scheduling..." : "Schedule"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="date-select">Select Date:</Label>
            <Input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-sm text-gray-500">
              {filteredAppointments.length} appointment(s) scheduled
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No appointments scheduled for this date</p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments
            .sort((a: any, b: any) => a.appointmentTime.localeCompare(b.appointmentTime))
            .map((appointment: any) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-lg">{appointment.appointmentTime}</span>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{appointment.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{appointment.customerPhone}</span>
                        </div>
                        {appointment.customerEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{appointment.customerEmail}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Service:</span>
                          <span className="font-medium ml-1">{appointment.serviceType}</span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <span className="text-gray-500 text-sm">Notes:</span>
                          <p className="text-sm mt-1">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {appointment.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: appointment.id, status: 'confirmed' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openEditModal(appointment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {appointment.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: appointment.id, status: 'cancelled' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Edit Appointment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceTypes.map((service: any) => (
                          <SelectItem key={service.id} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAppointmentMutation.isPending}>
                  {updateAppointmentMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
