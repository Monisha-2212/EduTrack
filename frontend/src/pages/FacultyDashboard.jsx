import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Users as UsersIcon, BookOpen, CheckCircle, GraduationCap } from 'lucide-react';
import { getAssignments, getUsers } from '../api/assignmentApi.js';
import { useSocket } from '../hooks/useSocket.js';
import { useNotifications } from '../hooks/useNotifications.js';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import StatCard from '../components/StatCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import AssignmentCard from '../components/AssignmentCard.jsx';
import NotificationList from '../components/NotificationList.jsx';
import CreateAssignmentDialog from '../components/CreateAssignmentDialog.jsx';
import GradeDialog from '../components/GradeDialog.jsx';
import { cn } from '../lib/utils.js';

export default function FacultyDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  // Real-time integration
  useSocket();
  const { unreadCount, markAllRead } = useNotifications();

  // Fetch data
  const { data: assignmentsData, isLoading: isLoadingAssignments, refetch: refetchAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await getAssignments();
      return res.data.assignments;
    },
  });

  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students-list'],
    queryFn: async () => {
      const res = await getUsers('student');
      return res.data.users;
    },
  });

  const assignments = assignmentsData ?? [];
  const students = studentsData ?? [];

  // ─── Stats calculation ───────────────────────────────────────────────────
  
  const stats = useMemo(() => {
    const now = new Date();
    const active = assignments.filter(a => new Date(a.deadline) > now).length;
    
    let totalSubmissions = 0;
    let ungradedSubmissions = 0;
    let sumMarks = 0;
    let gradedCount = 0;

    assignments.forEach(a => {
      totalSubmissions += a.submissions?.length ?? 0;
      a.submissions?.forEach(s => {
        if (s.status === 'submitted') ungradedSubmissions++;
        if (s.status === 'graded') {
          sumMarks += (s.marks / a.maxMarks) * 100;
          gradedCount++;
        }
      });
    });

    const avgMarks = gradedCount > 0 ? (sumMarks / gradedCount).toFixed(0) : 0;
    const uniqueStudentIds = new Set();
    assignments.forEach(a => a.assignedTo?.forEach(s => uniqueStudentIds.add(s._id)));

    return {
      totalAssignments: assignments.length,
      activeAssignments: active,
      totalSubmissions,
      ungradedSubmissions,
      studentsCount: uniqueStudentIds.size,
      avgMarks
    };
  }, [assignments]);

  // ─── Student Stats list ───────────────────────────────────────────────────

  const studentTableData = useMemo(() => {
    return students.map(s => {
      let submittedCount = 0;
      let totalAssigned = 0;
      let studentSumMarks = 0;
      let studentGradedCount = 0;

      assignments.forEach(a => {
        const isAssigned = a.assignedTo?.some(at => at._id === s._id);
        if (isAssigned) {
          totalAssigned++;
          const sub = a.submissions?.find(sub => sub.studentId === s._id);
          if (sub) {
            submittedCount++;
            if (sub.status === 'graded') {
              studentSumMarks += (sub.marks / a.maxMarks) * 100;
              studentGradedCount++;
            }
          }
        }
      });

      return {
        ...s,
        submittedCount,
        totalAssigned,
        avg: studentGradedCount > 0 ? (studentSumMarks / studentGradedCount).toFixed(0) : null
      };
    }).filter(s => 
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, assignments, studentSearch]);

  const handleGrade = (assignment) => {
    setSelectedAssignment(assignment);
    setShowGradeDialog(true);
  };

  const renderContent = () => {
    if (isLoadingAssignments || isLoadingStudents) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 animate-pulse bg-[#EDE8DF] dark:bg-[#1C1A17] rounded-2xl" />
            ))}
          </div>
          <div className="space-y-4">
             <div className="h-6 w-40 animate-pulse bg-[#EDE8DF] dark:bg-[#1C1A17] rounded" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-44 animate-pulse bg-[#EDE8DF] dark:bg-[#1C1A17] rounded-xl" />
               ))}
             </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'overview') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total Assignments" value={stats.totalAssignments} sub={`${stats.activeAssignments} active`} />
            <StatCard label="Submissions" value={stats.totalSubmissions} sub={`${stats.ungradedSubmissions} ungraded`} />
            <StatCard label="Students" value={stats.studentsCount} sub={`Avg ${stats.avgMarks}% marks`} />
          </div>

          <section>
            <SectionHeader title="Recent Assignments" actionLabel="See all" onAction={() => setActiveSection('assignments')} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.slice(0, 3).map(a => (
                <AssignmentCard 
                  key={a._id} 
                  assignment={a} 
                  onGrade={() => handleGrade(a)}
                  onViewSubmissions={() => handleGrade(a)} 
                />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Recent Notifications" actionLabel="Mark all read" onAction={markAllRead} />
            <NotificationList limit={3} />
          </section>
        </div>
      );
    }

    if (activeSection === 'assignments') {
      return (
        <section>
          <SectionHeader title="All Assignments" actionLabel="+ New Assignment" onAction={() => setShowCreateDialog(true)} />
          {assignments.length === 0 ? (
            <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26] rounded-xl py-12 flex flex-col items-center justify-center text-center">
              <BookOpen size={32} className="text-[#F5F0E8] dark:text-[#2C2A26] mb-2" />
              <p className="text-sm text-[#9A9288]">No assignments created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map(a => (
                <AssignmentCard 
                  key={a._id} 
                  assignment={a} 
                  onGrade={() => handleGrade(a)}
                  onViewSubmissions={() => handleGrade(a)}
                />
              ))}
            </div>
          )}
        </section>
      );
    }

    if (activeSection === 'students') {
      return (
        <section>
          <SectionHeader title="All Students" />
          <div className="relative mb-4 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9288]" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#E8E4DC] dark:border-[#2C2A26] rounded-xl bg-[#FFFDF9] dark:bg-[#1C1A17] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
            />
          </div>

          <div className="bg-[#FFFDF9] dark:bg-[#1C1A17] border border-[#EDE8DF] dark:border-[#2C2A26] rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-[#FAF8F5] dark:bg-[#1C1A17]/50 border-b border-[#EDE8DF] dark:border-[#2C2A26]">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-[#9A9288] uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#9A9288] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#9A9288] uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#9A9288] uppercase tracking-wider text-right">Avg Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE8DF] dark:divide-[#2C2A26]">
                {studentTableData.map(s => (
                  <tr key={s._id} className="hover:bg-[#FAF8F5]/50 dark:hover:bg-[#1C1A17]/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-[#1C1A17]/40 flex items-center justify-center text-xs font-bold text-[#8B6914] dark:text-[#F5F0E8] uppercase shrink-0">
                          {s.name[0]}
                        </div>
                        <span className="text-sm font-medium text-[#2C2A26] dark:text-[#F5F0E8]">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B6660] dark:text-[#9A9288] whitespace-nowrap">{s.email}</td>
                    <td className="px-6 py-4 text-sm text-[#6B6660] dark:text-[#9A9288] whitespace-nowrap">
                      {s.submittedCount} / {s.totalAssigned}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {s.avg !== null ? (
                        <span className={cn(
                          'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ring-1 ring-inset',
                          Number(s.avg) >= 80 ? 'bg-[#EDF4E8] text-[#3A5C28] ring-[#C9A96E]/40' : 
                          Number(s.avg) >= 60 ? 'bg-[#FDF5E4] text-[#7A5A10] ring-[#C9A96E]/40' : 
                          'bg-[#FBF0ED] text-[#8B3A22] ring-[#8B3A22]/20'
                        )}>
                          {s.avg}%
                        </span>
                      ) : (
                        <span className="text-xs text-[#D8D4CC] dark:text-[#3A3830]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    if (activeSection === 'notifications') {
      return (
        <section>
          <SectionHeader title="All Notifications" actionLabel="Mark all read" onAction={markAllRead} />
          <NotificationList />
        </section>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#1C1A17] font-sans">
      <Sidebar role="faculty" activeItem={activeSection} onNavigate={setActiveSection} />
      
      <main className="flex-1 flex flex-col md:ml-56 relative min-w-0">
        <TopBar 
          title={activeSection === 'overview' ? 'Faculty Insight' : activeSection === 'assignments' ? 'Curriculum' : activeSection === 'students' ? 'Enrollment' : 'Alerts'} 
          unreadCount={unreadCount}
          showCreateButton={true}
          onCreateClick={() => setShowCreateDialog(true)}
        />
        
        <div className="flex-1 overflow-y-auto p-6 pb-24 md:pb-8 custom-scrollbar">
          {renderContent()}
        </div>
      </main>

      <CreateAssignmentDialog 
        isOpen={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        onSuccess={refetchAssignments}
      />

      <GradeDialog 
        isOpen={showGradeDialog}
        onClose={() => { setShowGradeDialog(false); setSelectedAssignment(null); }}
        assignment={selectedAssignment}
        onSuccess={refetchAssignments}
      />
    </div>
  );
}
