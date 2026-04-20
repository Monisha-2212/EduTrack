import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, LayoutGrid, Bell, Loader2 } from 'lucide-react';
import { getAssignments } from '../api/assignmentApi.js';
import { useSocket } from '../hooks/useSocket.js';
import { useNotifications } from '../hooks/useNotifications.js';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import StudentAssignmentCard from '../components/StudentAssignmentCard.jsx';
import NotificationList from '../components/NotificationList.jsx';
import UploadDialog from '../components/UploadDialog.jsx';
import { cn } from '../lib/utils.js';

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Initialize Socket.io for real-time toasts and cache invalidation
  useSocket();
  
  const { unreadCount, markAllRead } = useNotifications();

  // Fetch assignments
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await getAssignments();
      return res.data.assignments;
    },
  });

  const assignments = data ?? [];
  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.deadline) - new Date(b.deadline)
  );

  const pendingAssignments = sortedAssignments.filter(a => !a.mySubmission);
  const recentAssignments = sortedAssignments.slice(0, 3);

  const handleUpload = (assignment) => {
    setSelectedAssignment(assignment);
    setShowUploadDialog(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-20 animate-pulse bg-[#EDE8DF] dark:bg-[#1C1A17] rounded-xl" />
          </div>
          <div className="space-y-4">
            <div className="h-6 w-32 animate-pulse bg-[#EDE8DF] dark:bg-[#1C1A17] rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 animate-pulse bg-[#EDE8DF] dark:bg-[#1C1A17] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'overview' || activeSection === 'assignments') {
      const list = activeSection === 'overview' ? recentAssignments : sortedAssignments;
      
      return (
        <div className="space-y-6">
          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-indigo-100 rounded-xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                   <BookOpen size={20} />
                 </div>
                 <div>
                   <p className="text-2xl font-semibold text-gray-900 leading-none">
                     {pendingAssignments.length}
                   </p>
                   <p className="text-xs text-gray-600 mt-1">Pending Assignments</p>
                 </div>
              </div>
            </div>
          )}

          <section>
            <SectionHeader 
              title={activeSection === 'overview' ? 'Upcoming Deadlines' : 'All Assignments'} 
              actionLabel={activeSection === 'overview' ? 'See all' : null}
              onAction={() => setActiveSection('assignments')}
            />
            
            {list.length === 0 ? (
               <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl py-12 flex flex-col items-center justify-center text-center">
                 <BookOpen size={32} className="text-[#F5F0E8] dark:text-[#2C2A26] mb-2" />
                 <p className="text-sm text-[#9A9288]">No assignments yet</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((a) => (
                  <StudentAssignmentCard 
                    key={a._id} 
                    assignment={a} 
                    onUpload={handleUpload}
                  />
                ))}
              </div>
            )}
          </section>

          {activeSection === 'overview' && (
            <section>
              <SectionHeader 
                title="Recent Notifications" 
                actionLabel="Mark all read"
                onAction={markAllRead}
              />
              <NotificationList limit={3} />
            </section>
          )}
        </div>
      );
    }

    if (activeSection === 'notifications') {
      return (
        <section>
          <SectionHeader 
            title="All Notifications" 
            actionLabel="Mark all read"
            onAction={markAllRead}
          />
          <NotificationList />
        </section>
      );
    }
    
    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-indigo-50 font-sans">
      <Sidebar 
        role="student" 
        activeItem={activeSection} 
        onNavigate={setActiveSection} 
      />
      
      <main className="flex-1 flex flex-col md:ml-56 relative min-w-0">
        <TopBar 
          title={activeSection === 'overview' ? 'Dashboard Overview' : activeSection === 'assignments' ? 'My Assignments' : 'Notifications'} 
          unreadCount={unreadCount}
        />
        
        <div className="flex-1 overflow-y-auto p-5 pb-24 md:pb-8 custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      <UploadDialog 
        isOpen={showUploadDialog} 
        onClose={() => setShowUploadDialog(false)}
        assignment={selectedAssignment}
        onSuccess={refetch}
      />
    </div>
  );
}
