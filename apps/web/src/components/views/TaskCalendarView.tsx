'use client';

import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  position: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
  };
}

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface TaskCalendarViewProps {
  tasks: Task[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
}

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  const router = useRouter();
  const events: CalendarEvent[] = tasks
    .filter((task) => task.dueDate)
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.dueDate!),
      end: new Date(task.dueDate!),
      resource: task,
    }));

  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '#3B82F6';

    switch (task.priority) {
      case 'URGENT':
        backgroundColor = '#EF4444';
        break;
      case 'HIGH':
        backgroundColor = '#F97316';
        break;
      case 'MEDIUM':
        backgroundColor = '#3B82F6';
        break;
      case 'LOW':
        backgroundColor = '#6B7280';
        break;
    }

    if (task.status === 'DONE') {
      backgroundColor = '#10B981';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    router.push(`/tasks/${event.id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6" style={{ height: '700px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        defaultView={Views.MONTH}
        messages={{
          next: 'Próximo',
          previous: 'Anterior',
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          agenda: 'Agenda',
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'Nenhuma tarefa neste período',
        }}
        components={{
          event: (props: any) => {
            const task = props.event.resource as Task;
            return (
              <div className="text-xs">
                <div className="font-medium truncate">{props.title}</div>
                {task.assignee && (
                  <div className="text-[10px] opacity-90 truncate">
                    {task.assignee.name}
                  </div>
                )}
              </div>
            );
          },
        }}
      />
    </div>
  );
}
