import { useEffect, useState } from 'react';
import { useData, useFilter } from '../hooks';

export default function Groups() {
  const [groups, setGroups] = useState<any[]>([]);

  const { meetings } = useData();
  const { filteredSlugs } = useFilter();

  useEffect(() => {
    const groupsSet = new Set<string>();

    filteredSlugs.forEach(slug => {
      const meeting = meetings[slug];
      if (meeting.group) {
        groupsSet.add(meeting.group);
      }
    });

    setGroups(Array.from(groupsSet).map((name, id) => ({ id, name })));
  }, [filteredSlugs]);

  return (
    <div>
      <h2>Groups</h2>
      <ul>
        {groups.map(group => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </div>
  );
}
