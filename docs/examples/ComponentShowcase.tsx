import React from 'react';
import { 
  Button,
  Input,
  Textarea,
  Checkbox,
  Radio,
  Select,
  Badge,
  Avatar,
  AvatarGroup,
  Spinner,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  LoadingOverlay,
  Tooltip,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverFooter,
} from '@nexora/ui';

import { 
  Save, 
  Trash, 
  Search, 
  Mail, 
  User, 
  AlertCircle,
  Settings,
  Plus,
  Filter,
} from 'lucide-react';

export function ComponentShowcase() {
  const [loading, setLoading] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      {/* Buttons Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" size="xs">Extra Small</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" loading>Loading...</Button>
            <Button variant="secondary" leftIcon={<Save />}>Save</Button>
            <Button variant="danger" leftIcon={<Trash />}>Delete</Button>
            <Button variant="outline" rightIcon={<Plus />}>Add Item</Button>
            <Button variant="primary" size="icon">
              <Settings />
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
          </div>
        </div>
      </section>

      {/* Form Inputs Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Form Inputs</h2>
        <div className="space-y-4 max-w-md">
          <Input 
            placeholder="Enter your email" 
            leftIcon={<Mail className="h-4 w-4" />}
            helperText="We'll never share your email"
          />

          <Input 
            placeholder="Search..." 
            leftIcon={<Search className="h-4 w-4" />}
          />

          <Input 
            type="email"
            placeholder="email@example.com"
            error="Please enter a valid email"
          />

          <Textarea 
            placeholder="Enter description..."
            helperText="Maximum 500 characters"
          />

          <Textarea 
            placeholder="Error example"
            error="This field is required"
          />

          <Select leftIcon={<Filter className="h-4 w-4" />}>
            <option value="">Select an option...</option>
            <option value="1">Option 1</option>
            <option value="2">Option 2</option>
            <option value="3">Option 3</option>
          </Select>

          <Select error="Please select a value">
            <option value="">Select status...</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </Select>

          <div className="space-y-3">
            <Checkbox label="I agree to terms and conditions" />
            <Checkbox label="Subscribe to newsletter" />
            <Checkbox 
              label="Required field" 
              error="You must accept this"
            />
          </div>

          <div className="space-y-3">
            <Radio label="Option A" name="choice" value="a" />
            <Radio label="Option B" name="choice" value="b" />
            <Radio label="Option C" name="choice" value="c" />
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Badges & Tags</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="primary" size="sm">Small</Badge>
            <Badge variant="primary" size="md">Medium</Badge>
            <Badge variant="primary" size="lg">Large</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="primary" removable onRemove={() => console.log('removed')}>
              Removable
            </Badge>
            <Badge variant="success" leftIcon={<AlertCircle className="h-3 w-3" />}>
              With Icon
            </Badge>
            <Badge variant="warning" removable onRemove={() => {}}>
              Tag 1
            </Badge>
            <Badge variant="info" removable onRemove={() => {}}>
              Tag 2
            </Badge>
          </div>
        </div>
      </section>

      {/* Avatars Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Avatars</h2>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Avatar size="xs" fallback="JD" />
            <Avatar size="sm" fallback="JD" />
            <Avatar size="md" fallback="John Doe" />
            <Avatar size="lg" fallback="Jane Smith" />
            <Avatar size="xl" fallback="Bob" />
            <Avatar size="2xl" fallback="AS" />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Avatar variant="circle" fallback="JD" />
            <Avatar variant="rounded" fallback="JD" />
            <Avatar variant="square" fallback="JD" />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Avatar fallback="JD" showStatus status="online" />
            <Avatar fallback="AS" showStatus status="away" />
            <Avatar fallback="BS" showStatus status="busy" />
            <Avatar fallback="OF" showStatus status="offline" />
          </div>

          <div>
            <p className="text-sm text-neutral-600 mb-3">Avatar Group (max 3):</p>
            <AvatarGroup max={3} size="md">
              <Avatar fallback="John Doe" />
              <Avatar fallback="Jane Smith" />
              <Avatar fallback="Bob Wilson" />
              <Avatar fallback="Alice Brown" />
              <Avatar fallback="Charlie Davis" />
            </AvatarGroup>
          </div>
        </div>
      </section>

      {/* Loading States Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Loading States</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-neutral-600 mb-3">Spinners:</p>
            <div className="flex flex-wrap gap-4 items-center">
              <Spinner size="xs" variant="primary" />
              <Spinner size="sm" variant="primary" />
              <Spinner size="md" variant="primary" />
              <Spinner size="lg" variant="primary" />
              <Spinner size="xl" variant="secondary" />
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-600 mb-3">Skeletons:</p>
            <div className="space-y-3 max-w-md">
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" height="200px" />
              <div className="flex gap-3 items-center">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-600 mb-3">Skeleton Helpers:</p>
            <div className="space-y-4 max-w-md">
              <SkeletonText lines={3} />
              <SkeletonCard />
            </div>
          </div>

          <div>
            <p className="text-sm text-neutral-600 mb-3">Loading Overlay:</p>
            <Button onClick={() => setLoading(!loading)}>
              Toggle Loading Overlay
            </Button>
            <LoadingOverlay 
              loading={loading} 
              text="Loading data..."
              className="mt-4"
            >
              <div className="p-8 bg-neutral-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Content Here</h3>
                <p className="text-neutral-600">
                  This content will be covered by the loading overlay when loading is true.
                </p>
              </div>
            </LoadingOverlay>
          </div>
        </div>
      </section>

      {/* Tooltips Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Tooltips</h2>
        <div className="flex flex-wrap gap-4">
          <Tooltip content="Tooltip on top" side="top">
            <Button variant="outline">Hover me (top)</Button>
          </Tooltip>
          <Tooltip content="Tooltip on right" side="right">
            <Button variant="outline">Hover me (right)</Button>
          </Tooltip>
          <Tooltip content="Tooltip on bottom" side="bottom">
            <Button variant="outline">Hover me (bottom)</Button>
          </Tooltip>
          <Tooltip content="Tooltip on left" side="left">
            <Button variant="outline">Hover me (left)</Button>
          </Tooltip>
        </div>
      </section>

      {/* Popovers Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Popovers</h2>
        <div className="flex flex-wrap gap-4">
          <Popover
            trigger={<Button variant="outline">Simple Popover</Button>}
          >
            <PopoverContent>
              <h3 className="font-semibold mb-2">Popover Title</h3>
              <p className="text-sm text-neutral-600">
                This is a simple popover with some content.
              </p>
            </PopoverContent>
          </Popover>

          <Popover
            trigger={<Button variant="outline">With Header & Footer</Button>}
            closeButton
          >
            <PopoverHeader>
              <h3 className="font-semibold">Confirm Action</h3>
            </PopoverHeader>
            <PopoverContent>
              <p className="text-sm text-neutral-600">
                Are you sure you want to proceed with this action?
              </p>
            </PopoverContent>
            <PopoverFooter>
              <Button size="sm" variant="ghost">Cancel</Button>
              <Button size="sm" variant="primary">Confirm</Button>
            </PopoverFooter>
          </Popover>

          <Popover
            trigger={<Button variant="outline">Controlled</Button>}
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
          >
            <PopoverContent>
              <p className="text-sm mb-3">This is a controlled popover.</p>
              <Button 
                size="sm" 
                onClick={() => setPopoverOpen(false)}
              >
                Close
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </section>
    </div>
  );
}

export default ComponentShowcase;
