import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

import Highlight from "@tiptap/extension-highlight";

import TextAlign from "@tiptap/extension-text-align";

import Image from "@tiptap/extension-image";

import {
  Color,
  TextStyle,
} from "@tiptap/extension-text-style";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Eye,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  value: string;

  onChange: (
    html: string,
  ) => void;

  minHeight?: number;
};

type ToolbarButtonProps = {
  active?: boolean;

  disabled?: boolean;

  title: string;

  onClick: () => void;

  children: ReactNode;
};

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

function ToolbarButton({
  active = false,
  disabled = false,
  title,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex
        h-9
        min-w-9
        items-center
        justify-center
        rounded-lg
        border
        px-2

        text-[12px]
        font-medium

        transition-all
        duration-200

        ${
          active
            ? `
              border-[#E75480]
              bg-[#E75480]
              text-white
              shadow-[0_3px_10px_rgba(231,84,128,0.18)]
            `
            : `
              border-[#E8D9DE]
              bg-white
              text-[#5C454D]

              hover:border-[#E75480]/50
              hover:bg-[#FFF7FA]
              hover:text-[#E75480]
            `
        }

        disabled:cursor-not-allowed
        disabled:opacity-35
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   TOOLBAR GROUP
========================================================= */

function ToolbarGroup({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        gap-1.5

        border-r
        border-[#E8D9DE]

        pr-2.5

        last:border-r-0
        last:pr-0
      "
    >
      {children}
    </div>
  );
}

/* =========================================================
   TIPTAP EDITOR
========================================================= */

export default function TiptapEditor({
  value,
  onChange,
  minHeight = 360,
}: Props) {
  const [mode, setMode] =
    useState<
      "visual" | "source"
    >("visual");

  const [
    sourceValue,
    setSourceValue,
  ] =
    useState(
      value || "",
    );

  /* =======================================================
     EDITOR
  ======================================================= */

  const editor =
    useEditor({
      extensions: [
        /*
         * StarterKit already includes:
         *
         * - Link
         * - Underline
         * - HorizontalRule
         * - Bold
         * - Italic
         * - Strike
         * - Blockquote
         * - Lists
         * - Headings
         * - Undo / Redo
         *
         * Do NOT import those extensions
         * separately or Tiptap will warn
         * about duplicate extension names.
         */
        StarterKit.configure({
          link: {
            openOnClick:
              false,

            autolink: true,

            HTMLAttributes:
              {
                rel: "noopener noreferrer",

                target:
                  "_blank",
              },
          },
        }),

        Highlight.configure({
          multicolor: true,
        }),

        TextStyle,

        Color,

        TextAlign.configure({
          types: [
            "heading",
            "paragraph",
          ],
        }),

        Image.configure({
          inline: false,

          allowBase64:
            false,
        }),
      ],

      content:
        value || "",

      /*
       * IMPORTANT:
       *
       * Do not put a multiline Tailwind
       * string here.
       *
       * ProseMirror handles this attribute
       * through DOMTokenList and spaces/newlines
       * can cause InvalidCharacterError.
       */
      editorProps: {
        attributes: {
          class:
            "nirjara-tiptap-editor",
        },
      },

      onUpdate: ({
        editor,
      }) => {
        const html =
          editor.getHTML();

        setSourceValue(
          html,
        );

        onChange(
          html,
        );
      },
    });

  /* =======================================================
     SYNC EXTERNAL VALUE
  ======================================================= */

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue =
      value || "";

    setSourceValue(
      nextValue,
    );

    if (
      editor.getHTML() !==
      nextValue
    ) {
      editor.commands.setContent(
        nextValue,
        {
          emitUpdate:
            false,
        },
      );
    }
  }, [
    editor,
    value,
  ]);

  /* =======================================================
     SWITCH TO SOURCE
  ======================================================= */

  const switchToSource =
    () => {
      if (!editor) {
        return;
      }

      const html =
        editor.getHTML();

      setSourceValue(
        html,
      );

      setMode(
        "source",
      );
    };

  /* =======================================================
     SWITCH TO VISUAL
  ======================================================= */

  const switchToVisual =
    () => {
      if (!editor) {
        return;
      }

      editor.commands.setContent(
        sourceValue ||
          "",
        {
          emitUpdate:
            false,
        },
      );

      onChange(
        sourceValue ||
          "",
      );

      setMode(
        "visual",
      );
    };

  /* =======================================================
     LINK
  ======================================================= */

  const setLink =
    () => {
      if (!editor) {
        return;
      }

      const existingUrl =
        editor.getAttributes(
          "link",
        ).href || "";

      const url =
        window.prompt(
          "Enter link URL",
          existingUrl,
        );

      if (
        url === null
      ) {
        return;
      }

      if (
        !url.trim()
      ) {
        editor
          .chain()
          .focus()
          .extendMarkRange(
            "link",
          )
          .unsetLink()
          .run();

        return;
      }

      editor
        .chain()
        .focus()
        .extendMarkRange(
          "link",
        )
        .setLink({
          href:
            url.trim(),
        })
        .run();
    };

  /* =======================================================
     IMAGE
  ======================================================= */

  const addImage =
    () => {
      if (!editor) {
        return;
      }

      const url =
        window.prompt(
          "Enter image URL",
        );

      if (
        !url?.trim()
      ) {
        return;
      }

      editor
        .chain()
        .focus()
        .setImage({
          src:
            url.trim(),
        })
        .run();
    };

  /* =======================================================
     COLOR
  ======================================================= */

  const handleColorChange =
    (
      event:
        ChangeEvent<HTMLInputElement>,
    ) => {
      if (!editor) {
        return;
      }

      editor
        .chain()
        .focus()
        .setColor(
          event.target
            .value,
        )
        .run();
    };

  /* =======================================================
     CLEAR EDITOR
  ======================================================= */

  const clearEditor =
    () => {
      if (!editor) {
        return;
      }

      const confirmed =
        window.confirm(
          "Clear all editor content?",
        );

      if (!confirmed) {
        return;
      }

      editor.commands.clearContent();

      setSourceValue(
        "",
      );

      onChange(
        "",
      );
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (!editor) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-[#E75480]/15
          bg-white

          p-6

          text-sm
          text-muted
        "
      >
        Loading editor...
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        overflow-hidden

        rounded-2xl

        border
        border-[#E75480]/15

        bg-white

        shadow-[0_5px_24px_rgba(58,42,47,0.035)]
      "
    >
      {/* =================================================
          MODE HEADER
      ================================================= */}

      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3

          border-b
          border-[#E8D9DE]

          bg-[#FFF9FB]

          px-4
          py-3
        "
      >
        <div>
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.2em]

              text-[#C77A95]
            "
          >
            Content Editor
          </p>

          <p
            className="
              mt-0.5

              text-xs

              text-[#9A828B]
            "
          >
            Write visually or edit the HTML source.
          </p>
        </div>

        {/* VISUAL / SOURCE */}

        <div
          className="
            inline-flex

            rounded-xl

            border
            border-[#E8D9DE]

            bg-white

            p-1
          "
        >
          <button
            type="button"
            onClick={
              switchToVisual
            }
            className={`
              inline-flex
              items-center
              gap-1.5

              rounded-lg

              px-3
              py-1.5

              text-[10px]
              font-semibold

              transition

              ${
                mode ===
                "visual"
                  ? "bg-[#3A2A2F] text-white"
                  : "text-[#806B73] hover:text-[#E75480]"
              }
            `}
          >
            <Eye
              size={13}
            />

            Visual
          </button>

          <button
            type="button"
            onClick={
              switchToSource
            }
            className={`
              inline-flex
              items-center
              gap-1.5

              rounded-lg

              px-3
              py-1.5

              text-[10px]
              font-semibold

              transition

              ${
                mode ===
                "source"
                  ? "bg-[#3A2A2F] text-white"
                  : "text-[#806B73] hover:text-[#E75480]"
              }
            `}
          >
            <Code2
              size={13}
            />

            Source
          </button>
        </div>
      </div>

      {/* =================================================
          VISUAL MODE
      ================================================= */}

      {mode ===
        "visual" && (
        <>
          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2.5

              border-b
              border-[#E8D9DE]

              bg-[#FFF7FA]

              px-3
              py-3
            "
          >
            {/* =============================================
                TEXT TYPE
            ============================================= */}

            <ToolbarGroup>
              <ToolbarButton
                title="Paragraph"
                active={
                  editor.isActive(
                    "paragraph",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setParagraph()
                    .run()
                }
              >
                <Type
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Heading 2"
                active={editor.isActive(
                  "heading",
                  {
                    level: 2,
                  },
                )}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({
                      level: 2,
                    })
                    .run()
                }
              >
                <Heading2
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Heading 3"
                active={editor.isActive(
                  "heading",
                  {
                    level: 3,
                  },
                )}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({
                      level: 3,
                    })
                    .run()
                }
              >
                <Heading3
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Heading 4"
                active={editor.isActive(
                  "heading",
                  {
                    level: 4,
                  },
                )}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({
                      level: 4,
                    })
                    .run()
                }
              >
                <Heading4
                  size={15}
                />
              </ToolbarButton>
            </ToolbarGroup>

            {/* =============================================
                TEXT FORMATTING
            ============================================= */}

            <ToolbarGroup>
              <ToolbarButton
                title="Bold"
                active={
                  editor.isActive(
                    "bold",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleBold()
                    .run()
                }
              >
                <Bold
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Italic"
                active={
                  editor.isActive(
                    "italic",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleItalic()
                    .run()
                }
              >
                <Italic
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Underline"
                active={
                  editor.isActive(
                    "underline",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleUnderline()
                    .run()
                }
              >
                <UnderlineIcon
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Strike"
                active={
                  editor.isActive(
                    "strike",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleStrike()
                    .run()
                }
              >
                <Strikethrough
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Highlight"
                active={
                  editor.isActive(
                    "highlight",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleHighlight({
                      color:
                        "#FFF0A8",
                    })
                    .run()
                }
              >
                <Highlighter
                  size={15}
                />
              </ToolbarButton>

              {/* COLOR */}

              <label
                title="Text colour"
                className="
                  flex
                  h-9
                  w-9
                  cursor-pointer
                  items-center
                  justify-center

                  rounded-lg

                  border
                  border-[#E8D9DE]

                  bg-white

                  transition

                  hover:border-[#E75480]/50
                "
              >
                <span
                  className="
                    h-4
                    w-4

                    rounded-sm

                    bg-[#3A2A2F]
                  "
                />

                <input
                  type="color"
                  className="sr-only"
                  defaultValue="#3A2A2F"
                  onChange={
                    handleColorChange
                  }
                />
              </label>
            </ToolbarGroup>

            {/* =============================================
                LISTS
            ============================================= */}

            <ToolbarGroup>
              <ToolbarButton
                title="Bulleted list"
                active={
                  editor.isActive(
                    "bulletList",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleBulletList()
                    .run()
                }
              >
                <List
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Numbered list"
                active={
                  editor.isActive(
                    "orderedList",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleOrderedList()
                    .run()
                }
              >
                <ListOrdered
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Quote"
                active={
                  editor.isActive(
                    "blockquote",
                  )
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .toggleBlockquote()
                    .run()
                }
              >
                <Quote
                  size={15}
                />
              </ToolbarButton>
            </ToolbarGroup>

            {/* =============================================
                LINK / IMAGE / DIVIDER
            ============================================= */}

            <ToolbarGroup>
              <ToolbarButton
                title="Link"
                active={
                  editor.isActive(
                    "link",
                  )
                }
                onClick={
                  setLink
                }
              >
                <Link2
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Insert image"
                onClick={
                  addImage
                }
              >
                <ImagePlus
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Divider"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setHorizontalRule()
                    .run()
                }
              >
                <Minus
                  size={15}
                />
              </ToolbarButton>
            </ToolbarGroup>

            {/* =============================================
                ALIGNMENT
            ============================================= */}

            <ToolbarGroup>
              <ToolbarButton
                title="Align left"
                active={editor.isActive({
                  textAlign:
                    "left",
                })}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign(
                      "left",
                    )
                    .run()
                }
              >
                <AlignLeft
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Align centre"
                active={editor.isActive({
                  textAlign:
                    "center",
                })}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign(
                      "center",
                    )
                    .run()
                }
              >
                <AlignCenter
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Align right"
                active={editor.isActive({
                  textAlign:
                    "right",
                })}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign(
                      "right",
                    )
                    .run()
                }
              >
                <AlignRight
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Justify"
                active={editor.isActive({
                  textAlign:
                    "justify",
                })}
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .setTextAlign(
                      "justify",
                    )
                    .run()
                }
              >
                <AlignJustify
                  size={15}
                />
              </ToolbarButton>
            </ToolbarGroup>

            {/* =============================================
                EDITOR TOOLS
            ============================================= */}

            <ToolbarGroup>
              <ToolbarButton
                title="Clear formatting"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .unsetAllMarks()
                    .clearNodes()
                    .run()
                }
              >
                <RemoveFormatting
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Undo"
                disabled={
                  !editor.can()
                    .chain()
                    .focus()
                    .undo()
                    .run()
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .undo()
                    .run()
                }
              >
                <Undo2
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Redo"
                disabled={
                  !editor.can()
                    .chain()
                    .focus()
                    .redo()
                    .run()
                }
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .redo()
                    .run()
                }
              >
                <Redo2
                  size={15}
                />
              </ToolbarButton>

              <ToolbarButton
                title="Clear editor"
                onClick={
                  clearEditor
                }
              >
                <Eraser
                  size={15}
                />
              </ToolbarButton>
            </ToolbarGroup>
          </div>

          {/* =================================================
              EDITOR CONTENT
          ================================================= */}

          <div
            style={{
              minHeight,
            }}
            className="
              bg-white
            "
          >
            <EditorContent
              editor={editor}
            />
          </div>
        </>
      )}

      {/* =================================================
          SOURCE MODE
      ================================================= */}

      {mode ===
        "source" && (
        <div>
          {/* SOURCE HEADER */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-3

              border-b
              border-[#E8D9DE]

              bg-[#FCF8FA]

              px-4
              py-2.5
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]

                  text-[#E75480]
                "
              >
                HTML Source
              </p>

              <p
                className="
                  mt-0.5

                  text-[11px]

                  text-[#9A828B]
                "
              >
                Edit your HTML directly, then apply it to return to Visual mode.
              </p>
            </div>

            <button
              type="button"
              onClick={
                switchToVisual
              }
              className="
                rounded-full

                bg-[#3A2A2F]

                px-4
                py-2

                text-[9px]
                font-semibold
                uppercase
                tracking-[0.13em]

                text-white

                transition

                hover:bg-[#E75480]
              "
            >
              Apply HTML
            </button>
          </div>

          {/* SOURCE TEXTAREA */}

          <textarea
            value={
              sourceValue
            }
            onChange={(
              event,
            ) => {
              const html =
                event.target
                  .value;

              setSourceValue(
                html,
              );

              onChange(
                html,
              );
            }}
            spellCheck={
              false
            }
            style={{
              minHeight,
            }}
            className="
              block
              w-full

              resize-y

              bg-[#201D1E]

              px-5
              py-5

              font-mono
              text-[13px]
              leading-6

              text-[#F8EDEF]

              outline-none

              selection:bg-[#E75480]/40
            "
          />

          {/* SOURCE FOOTER */}

          <div
            className="
              border-t
              border-[#3A2A2F]

              bg-[#181617]

              px-4
              py-2

              text-[10px]
              text-white/50
            "
          >
            Raw HTML • Changes will be saved with the blog content
          </div>
        </div>
      )}
    </div>
  );
}