import { useUser } from '@clerk/clerk-react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/ui/DashboardLayout';

const Profile = () => {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!isLoaded) {
    return <DashboardLayout><div>Loading...</div></DashboardLayout>;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await user.update({ firstName, lastName });
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await user.delete();
      // Optionally, redirect to home or sign-in page after deletion
      window.location.href = '/';
    } catch (err) {
      setDeleteError('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input value={user.primaryEmailAddress?.emailAddress || ''} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <Input value={user.publicMetadata?.role || 'user'} disabled />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <CardFooter className="flex flex-col items-start gap-2 px-0">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                {success && <span className="text-green-600 text-sm">Profile updated!</span>}
              </CardFooter>
            </form>
            <div className="mt-8 border-t pt-6">
              <div className="mb-2 font-semibold text-red-600">Danger Zone</div>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting Account...' : 'Delete Account'}
              </Button>
              {deleteError && <div className="text-red-600 text-sm mt-2">{deleteError}</div>}
              <div className="text-xs text-muted-foreground mt-2">This will permanently delete your account and all associated data.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
