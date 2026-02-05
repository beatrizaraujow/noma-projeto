import React, { useState } from 'react';
import {
  // Cards
  ProjectCard,
  TaskCard,
  UserCard,
  // Modals
  Modal,
  Dialog,
  ConfirmDialog,
  // Dropdowns
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownSubmenu,
  // Search
  SearchBar,
  SearchOption,
  // Navigation
  Sidebar,
  SidebarItem,
  SidebarSection,
  Topbar,
  // States
  EmptyState,
  ErrorState,
  InlineError,
  ErrorBanner,
  // Atoms
  Button,
  Badge,
} from '@noma/ui';
import {
  Home,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Share2,
} from 'lucide-react';

export default function MoleculeShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Search suggestions
  const searchSuggestions: SearchOption[] = [
    {
      id: '1',
      label: 'Project Alpha',
      description: 'Main development project',
      category: 'Projects',
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      id: '2',
      label: 'Design Task',
      description: 'UI/UX improvements',
      category: 'Tasks',
      icon: <CheckSquare className="h-4 w-4" />,
    },
    {
      id: '3',
      label: 'John Doe',
      description: 'john@example.com',
      category: 'Users',
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      >
        <SidebarSection title="Main" collapsed={sidebarCollapsed}>
          <SidebarItem
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            active
            collapsed={sidebarCollapsed}
          />
          <SidebarItem
            icon={<FolderKanban className="h-5 w-5" />}
            label="Projects"
            badge={12}
            collapsed={sidebarCollapsed}
          />
          <SidebarItem
            icon={<CheckSquare className="h-5 w-5" />}
            label="Tasks"
            badge={5}
            collapsed={sidebarCollapsed}
          />
          <SidebarItem
            icon={<Users className="h-5 w-5" />}
            label="Team"
            collapsed={sidebarCollapsed}
          />
        </SidebarSection>

        <SidebarSection title="Settings" collapsed={sidebarCollapsed}>
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            collapsed={sidebarCollapsed}
          />
        </SidebarSection>
      </Sidebar>

      {/* Main Content */}
      <div className={`transition-all ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Topbar
          user={{
            name: 'John Doe',
            email: 'john@example.com',
            avatar: undefined,
          }}
          notifications={3}
          onSearch={(value) => console.log('Search:', value)}
          onLogout={() => console.log('Logout')}
        >
          <h1 className="text-xl font-semibold">Component Library - Molecules</h1>
        </Topbar>

        <main className="p-6 space-y-12">
          {/* Error Banner */}
          {showBanner && (
            <ErrorBanner
              variant="warning"
              title="Maintenance Scheduled"
              message="System maintenance is scheduled for tonight at 10 PM UTC. Some features may be unavailable."
              dismissible
              onDismiss={() => setShowBanner(false)}
              action={{
                label: 'Learn more',
                onClick: () => console.log('Learn more'),
              }}
            />
          )}

          {/* Search Bar */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Search Bar</h2>
            <div className="max-w-2xl">
              <SearchBar
                value={searchValue}
                onValueChange={setSearchValue}
                suggestions={searchSuggestions}
                onSelect={(option) => console.log('Selected:', option)}
                placeholder="Search projects, tasks, or people..."
                size="lg"
              />
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProjectCard
                title="Website Redesign"
                description="Complete overhaul of the company website with modern UI/UX"
                progress={65}
                members={[
                  { name: 'John Doe', avatar: undefined },
                  { name: 'Jane Smith', avatar: undefined },
                  { name: 'Bob Johnson', avatar: undefined },
                ]}
                dueDate={new Date('2024-02-15')}
                status="in-progress"
                onClick={() => console.log('Project clicked')}
              />

              <TaskCard
                title="Update API Documentation"
                description="Add new endpoints and update authentication section"
                status="in-progress"
                priority="high"
                assignee={{ name: 'John Doe', avatar: undefined }}
                dueDate={new Date('2024-01-25')}
                labels={['documentation', 'api']}
                onClick={() => console.log('Task clicked')}
              />

              <UserCard
                name="Jane Smith"
                role="Senior Developer"
                avatar={undefined}
                stats={[
                  { label: 'Projects', value: 12 },
                  { label: 'Tasks', value: 45 },
                  { label: 'Completed', value: 89 },
                ]}
                actions={[
                  { label: 'View Profile', onClick: () => console.log('View') },
                  { label: 'Send Message', onClick: () => console.log('Message') },
                ]}
              />
            </div>
          </section>

          {/* Modals & Dialogs */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Modals & Dialogs</h2>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                Open Dialog
              </Button>
              <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                Delete Item
              </Button>
            </div>

            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <Modal.Header title="Create New Project" />
              <Modal.Body>
                <p className="text-neutral-600 dark:text-neutral-400">
                  This is a custom modal with header, body, and footer sections.
                  You can put any content here including forms, images, or other components.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>
                  Create
                </Button>
              </Modal.Footer>
            </Modal>

            <Dialog
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              title="Information"
              description="This is a simple dialog component for displaying information to users."
              actions={[
                {
                  label: 'Cancel',
                  onClick: () => setIsDialogOpen(false),
                  variant: 'outline',
                },
                {
                  label: 'Confirm',
                  onClick: () => setIsDialogOpen(false),
                  variant: 'primary',
                },
              ]}
            />

            <ConfirmDialog
              open={isConfirmOpen}
              onClose={() => setIsConfirmOpen(false)}
              title="Delete Project?"
              description="This action cannot be undone. All project data will be permanently deleted."
              onConfirm={async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setIsConfirmOpen(false);
              }}
              variant="danger"
              confirmText="Delete"
            />
          </section>

          {/* Dropdowns */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Dropdowns & Menus</h2>
            <div className="flex flex-wrap gap-4">
              <Dropdown
                trigger={
                  <Button variant="outline">
                    Actions <MoreHorizontal className="h-4 w-4 ml-2" />
                  </Button>
                }
              >
                <DropdownItem icon={<Edit className="h-4 w-4" />}>
                  Edit
                </DropdownItem>
                <DropdownItem icon={<Download className="h-4 w-4" />}>
                  Download
                </DropdownItem>
                <DropdownSeparator />
                <DropdownSubmenu
                  label="Share"
                  icon={<Share2 className="h-4 w-4" />}
                >
                  <DropdownItem>Email</DropdownItem>
                  <DropdownItem>Copy Link</DropdownItem>
                  <DropdownItem>Social Media</DropdownItem>
                </DropdownSubmenu>
                <DropdownSeparator />
                <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger>
                  Delete
                </DropdownItem>
              </Dropdown>
            </div>
          </section>

          {/* Empty States */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Empty States</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <EmptyState
                  variant="inbox"
                  title="No messages yet"
                  description="When you receive messages, they will appear here."
                  action={{
                    label: 'Compose message',
                    onClick: () => console.log('Compose'),
                  }}
                />
              </div>

              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <EmptyState
                  variant="files"
                  title="No files uploaded"
                  description="Upload your first file to get started."
                  action={{
                    label: 'Upload file',
                    onClick: () => console.log('Upload'),
                  }}
                  secondaryAction={{
                    label: 'Browse examples',
                    onClick: () => console.log('Browse'),
                  }}
                />
              </div>
            </div>
          </section>

          {/* Error States */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Error States</h2>
            <div className="space-y-6">
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <ErrorState
                  variant="404"
                  action={{
                    label: 'Go to homepage',
                    onClick: () => console.log('Home'),
                  }}
                  secondaryAction={{
                    label: 'Contact support',
                    onClick: () => console.log('Support'),
                  }}
                />
              </div>

              <InlineError
                variant="error"
                message="Failed to save changes. Please check your connection and try again."
              />

              <InlineError
                variant="warning"
                message="Your session will expire in 5 minutes. Please save your work."
              />

              <InlineError
                variant="info"
                message="New updates are available. Refresh the page to see the latest changes."
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
