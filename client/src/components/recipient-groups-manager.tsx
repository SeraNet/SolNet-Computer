import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  UserPlus,
  UserMinus,
  Search,
  Eye,
} from "lucide-react";

// Recipient Group Schema
const recipientGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  description: z.string().optional(),
});

type RecipientGroupForm = z.infer<typeof recipientGroupSchema>;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city?: string;
}

interface RecipientGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupWithMemberCount extends RecipientGroup {
  memberCount: number;
}

export function RecipientGroupsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingGroup, setEditingGroup] = useState<RecipientGroup | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const form = useForm<RecipientGroupForm>({
    resolver: zodResolver(recipientGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await apiRequest("/api/customers", "GET");
      return response as Customer[];
    },
  });

  // Fetch recipient groups
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["recipient-groups"],
    queryFn: async () => {
      const response = await apiRequest("/api/recipient-groups", "GET");
      return response as RecipientGroup[];
    },
  });

  // Fetch group members for selected group
  const { data: groupMembers, isLoading: membersLoading } = useQuery({
    queryKey: ["recipient-group-members", selectedGroup],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const response = await apiRequest(
        `/api/recipient-groups/${selectedGroup}/customers`,
        "GET"
      );
      return response as Customer[];
    },
    enabled: !!selectedGroup,
  });

  // Fetch member counts for all groups
  const { data: groupMemberCounts, isLoading: countsLoading } = useQuery({
    queryKey: ["recipient-group-member-counts"],
    queryFn: async () => {
      const response = await apiRequest(
        "/api/recipient-groups/member-counts",
        "GET"
      );
      return response as Record<string, number>;
    },
    enabled: true,
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: RecipientGroupForm) => {
      return await apiRequest("/api/recipient-groups", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipient group created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["recipient-groups"] });
      queryClient.invalidateQueries({
        queryKey: ["recipient-group-member-counts"],
      });
      setShowCreateForm(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create recipient group",
        variant: "destructive",
      });
    },
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: async (data: RecipientGroupForm) => {
      return await apiRequest(
        `/api/recipient-groups/${editingGroup?.id}`,
        "PUT",
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipient group updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["recipient-groups"] });
      setEditingGroup(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update recipient group",
        variant: "destructive",
      });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest(`/api/recipient-groups/${groupId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipient group deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["recipient-groups"] });
      queryClient.invalidateQueries({
        queryKey: ["recipient-group-member-counts"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete recipient group",
        variant: "destructive",
      });
    },
  });

  // Add customers to group mutation
  const addCustomersToGroupMutation = useMutation({
    mutationFn: async ({
      groupId,
      customerIds,
    }: {
      groupId: string;
      customerIds: string[];
    }) => {
      const promises = customerIds.map((customerId) =>
        apiRequest(
          `/api/recipient-groups/${groupId}/customers/${customerId}`,
          "POST"
        )
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customers added to group successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["recipient-group-members"] });
      queryClient.invalidateQueries({
        queryKey: ["recipient-group-member-counts"],
      });
      setSelectedCustomers([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add customers to group",
        variant: "destructive",
      });
    },
  });

  // Remove customer from group mutation
  const removeCustomerFromGroupMutation = useMutation({
    mutationFn: async ({
      groupId,
      customerId,
    }: {
      groupId: string;
      customerId: string;
    }) => {
      return await apiRequest(
        `/api/recipient-groups/${groupId}/customers/${customerId}`,
        "DELETE"
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer removed from group successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["recipient-group-members"] });
      queryClient.invalidateQueries({
        queryKey: ["recipient-group-member-counts"],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove customer from group",
        variant: "destructive",
      });
    },
  });

  // Filter customers based on search query
  const filteredCustomers =
    customers?.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    }) || [];

  // Check if customer is in group
  const isCustomerInGroup = (customerId: string) => {
    return groupMembers?.some((member) => member.id === customerId) || false;
  };

  // Get member count for a group
  const getMemberCount = (groupId: string) => {
    return groupMemberCounts?.[groupId] || 0;
  };

  // Handle form submission
  const onSubmit = (data: RecipientGroupForm) => {
    if (editingGroup) {
      updateGroupMutation.mutate(data);
    } else {
      createGroupMutation.mutate(data);
    }
  };

  // Handle edit group
  const handleEditGroup = (group: RecipientGroup) => {
    setEditingGroup(group);
    form.setValue("name", group.name);
    form.setValue("description", group.description || "");
    // Ensure members for this group are fetched/displayed while editing
    setSelectedGroup(group.id);
  };

  // Handle delete group
  const handleDeleteGroup = (groupId: string) => {
    if (confirm("Are you sure you want to delete this group?")) {
      deleteGroupMutation.mutate(groupId);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingGroup(null);
    setShowCreateForm(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Recipient Groups
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Create groups and manually assign customers for targeted SMS campaigns
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Group
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create/Edit Form */}
        {(showCreateForm || editingGroup) && (
          <div className="lg:col-span-2">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  {editingGroup ? "Edit Group" : "Create New Group"}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {editingGroup
                    ? "Edit your recipient group"
                    : "Create a new recipient group for organizing customers"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Muslim Customers, VIP Customers, Addis Ababa Customers"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe this group and how you'll identify members..."
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={
                          createGroupMutation.isPending ||
                          updateGroupMutation.isPending
                        }
                        className="flex items-center gap-2"
                      >
                        {createGroupMutation.isPending ||
                        updateGroupMutation.isPending ? (
                          <>
                            <Save className="h-4 w-4 animate-spin" />
                            {editingGroup ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {editingGroup ? "Update Group" : "Create Group"}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Groups List */}
        <div className="lg:col-span-1">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Your Groups
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {groups?.length || 0} recipient groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {groups?.map((group) => {
                  const memberCount = getMemberCount(group.id);
                  return (
                    <div key={group.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{group.name}</h4>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGroup(group)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={deleteGroupMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {group.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          {group.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {countsLoading
                            ? "Loading..."
                            : `${memberCount} member${
                                memberCount !== 1 ? "s" : ""
                              }`}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGroup(group.id)}
                        className="w-full"
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        Manage Members
                      </Button>
                    </div>
                  );
                })}
                {(!groups || groups.length === 0) && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                    No groups yet. Create your first group!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Assignment Section */}
      {selectedGroup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Manage Members:{" "}
              {groups?.find((g) => g.id === selectedGroup)?.name}
            </CardTitle>
            <CardDescription>
              Manually add or remove customers from this group based on your
              criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Current Members */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    Current Members ({groupMembers?.length || 0})
                  </h4>
                  {membersLoading && (
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Loading...
                    </span>
                  )}
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2">
                  {groupMembers && groupMembers.length > 0 ? (
                    groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 border rounded-lg flex items-center justify-between bg-green-50 border-green-200"
                      >
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {member.phone}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeCustomerFromGroupMutation.mutate({
                              groupId: selectedGroup,
                              customerId: member.id,
                            })
                          }
                          disabled={removeCustomerFromGroupMutation.isPending}
                        >
                          <UserMinus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No members in this group yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Customers</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, phone, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedGroup("")}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>

              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {filteredCustomers.length} of {customers?.length || 0}{" "}
                  customers
                </span>
                {filteredCustomers.length > 0 && (
                  <span>
                    {
                      filteredCustomers.filter((c) => !isCustomerInGroup(c.id))
                        .length
                    }{" "}
                    available to add
                  </span>
                )}
              </div>

              {/* Customer List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">All Customers</h4>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedCustomers(
                          filteredCustomers
                            .filter((c) => !isCustomerInGroup(c.id))
                            .map((c) => c.id)
                        )
                      }
                    >
                      Select Available
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCustomers([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredCustomers?.map((customer) => {
                    const isInGroup = groupMembers?.some(
                      (member) => member.id === customer.id
                    );
                    const isSelected = selectedCustomers.includes(customer.id);

                    return (
                      <div
                        key={customer.id}
                        className={`p-3 border rounded-lg flex items-center justify-between ${
                          isInGroup ? "bg-green-50 border-green-200" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCustomers([
                                  ...selectedCustomers,
                                  customer.id,
                                ]);
                              } else {
                                setSelectedCustomers(
                                  selectedCustomers.filter(
                                    (id) => id !== customer.id
                                  )
                                );
                              }
                            }}
                            disabled={isInGroup}
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {customer.name}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {customer.phone}
                            </p>
                            {customer.city && (
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                📍 {customer.city}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isInGroup && (
                            <Badge variant="secondary" className="text-xs">
                              Already in group
                            </Badge>
                          )}
                          {isInGroup ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeCustomerFromGroupMutation.mutate({
                                  groupId: selectedGroup,
                                  customerId: customer.id,
                                })
                              }
                              disabled={
                                removeCustomerFromGroupMutation.isPending
                              }
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                addCustomersToGroupMutation.mutate({
                                  groupId: selectedGroup,
                                  customerIds: [customer.id],
                                })
                              }
                              disabled={addCustomersToGroupMutation.isPending}
                            >
                              <UserPlus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredCustomers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No customers found matching your search.</p>
                    <p className="text-sm">Try adjusting your search terms.</p>
                  </div>
                )}

                {/* Bulk Actions */}
                {selectedCustomers.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {selectedCustomers.length} customer(s) selected
                    </p>
                    <Button
                      type="button"
                      onClick={() =>
                        addCustomersToGroupMutation.mutate({
                          groupId: selectedGroup,
                          customerIds: selectedCustomers,
                        })
                      }
                      disabled={addCustomersToGroupMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {addCustomersToGroupMutation.isPending ? (
                        <>
                          <Save className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Add Selected to Group
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
