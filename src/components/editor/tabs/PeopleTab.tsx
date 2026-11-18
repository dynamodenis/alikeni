import type { Host } from "@/templates/_shared/schema"
import { useEditor } from "../EditorContext"
import { ListEditor } from "../ListEditor"
import { editorCopy, roleOptions } from "../copy"
import { Group, SelectField, TextField } from "../fields"
import { ImageField } from "../media"

const capitalise = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1)

export function PeopleTab() {
  const { module, config } = useEditor()
  const copy = editorCopy(module.meta.category)
  return (
    <Group title={copy.peopleTitle} description={copy.peopleDescription}>
      <ListEditor<Host>
        path={["hosts"]}
        min={1}
        max={8}
        addLabel={`Add ${copy.person}`}
        itemLabel={(h, i) => h.name || `${capitalise(copy.person)} ${i + 1}`}
        create={() => ({ name: `New ${copy.person}`, role: copy.newRole })}
      >
        {(index, p) => (
          <>
            <TextField
              path={[...p, "name"]}
              label="Full name"
              maxLength={120}
            />
            <TextField
              path={[...p, "shortName"]}
              label="Short name"
              optional
              maxLength={40}
              help={copy.shortNameHelp}
            />
            <SelectField
              path={[...p, "role"]}
              label="Role"
              options={roleOptions(copy, config.hosts[index]?.role)}
            />
            <TextField
              path={[...p, "parentsLine"]}
              label={copy.lineLabel}
              optional
              maxLength={200}
              placeholder={copy.linePlaceholder}
            />
            {copy.topicLabel && (
              <TextField
                path={[...p, "topic"]}
                label={copy.topicLabel}
                optional
                maxLength={200}
                placeholder={copy.topicPlaceholder}
                className="sm:col-span-2"
              />
            )}
            <ImageField
              path={[...p, "photo"]}
              purpose="portrait"
              label="Portrait"
              className="sm:col-span-2"
            />
          </>
        )}
      </ListEditor>
    </Group>
  )
}
