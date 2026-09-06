import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function TiptapEditor({
  value,
  onChange,
  placeholder = "Write the full blog content here...",
}: TiptapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),

      Underline,

      TextStyle,

      Color,

      Highlight.configure({
        multicolor: true,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-[#E75480] underline",
        },
      }),

      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class:
            "my-6 h-auto max-w-full rounded-2xl object-cover",
        },
      }),

      Placeholder.configure({
        placeholder,
      }),
    ],

    content: value || "",

    editorProps: {
      attributes: {
        class:
          "min-h-[350px] w-full bg-white px-5 py-5 text-sm leading-7 text-[#3A2A2F] outline-none md:text-base",
      },
    },

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const incomingContent = value || "";
    const currentContent = editor.getHTML();

    if (currentContent !== incomingContent) {
      editor.commands.setContent(incomingContent, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  const uploadArticleImage = async (file: File) => {
    try {
      setIsUploadingImage(true);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      if (!data.imageUrl) {
        throw new Error("The server did not return an image URL");
      }

      editor
        ?.chain()
        .focus()
        .setImage({
          src: data.imageUrl,
          alt: file.name,
          title: file.name,
        })
        .run();
    } catch (error) {
      console.error("Article image upload error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to upload the article image."
      );
    } finally {
      setIsUploadingImage(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const addLink = () => {
    if (!editor) return;

    const previousUrl =
      editor.getAttributes("link").href || "";

    const url = window.prompt(
      "Enter the link URL:",
      previousUrl
    );

    if (url === null) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    const normalisedUrl = /^(https?:\/\/|mailto:|tel:)/i.test(
      trimmedUrl
    )
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: normalisedUrl,
        target: "_blank",
      })
      .run();
  };

  if (!editor) {
    return (
      <div className="min-h-[350px] rounded-2xl border border-[#E75480]/20 bg-white p-5 text-sm text-[#8A6F78]">
        Loading editor...
      </div>
    );
  }

  const buttonClass = (
    active = false,
    disabled = false
  ) =>
    [
      "rounded-lg border px-3 py-2 text-xs font-medium transition",
      active
        ? "border-[#E75480] bg-[#E75480] text-white"
        : "border-[#E75480]/20 bg-white text-[#6B4A55] hover:border-[#E75480] hover:bg-[#FFF5F8]",
      disabled ? "cursor-not-allowed opacity-40" : "",
    ].join(" ");

  const canUndo = editor.can().chain().focus().undo().run();
  const canRedo = editor.can().chain().focus().redo().run();

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E75480]/20 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E75480]/20 bg-[#FFF5F8] p-3">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setParagraph().run()
          }
          className={buttonClass(
            editor.isActive("paragraph")
          )}
        >
          Paragraph
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          className={buttonClass(
            editor.isActive("heading", { level: 2 })
          )}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 3 })
              .run()
          }
          className={buttonClass(
            editor.isActive("heading", { level: 3 })
          )}
        >
          H3
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 4 })
              .run()
          }
          className={buttonClass(
            editor.isActive("heading", { level: 4 })
          )}
        >
          H4
        </button>

        <span className="mx-1 h-7 w-px bg-[#E75480]/20" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className={buttonClass(editor.isActive("bold"))}
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className={buttonClass(editor.isActive("italic"))}
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleUnderline().run()
          }
          className={buttonClass(
            editor.isActive("underline")
          )}
        >
          Underline
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleStrike().run()
          }
          className={buttonClass(editor.isActive("strike"))}
        >
          Strike
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHighlight().run()
          }
          className={buttonClass(
            editor.isActive("highlight")
          )}
        >
          Highlight
        </button>

        <label
          title="Text colour"
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E75480]/20 bg-white px-3 py-2 text-xs text-[#6B4A55]"
        >
          Colour

          <input
            type="color"
            value={
              editor.getAttributes("textStyle").color ||
              "#3A2A2F"
            }
            onChange={(event) =>
              editor
                .chain()
                .focus()
                .setColor(event.target.value)
                .run()
            }
            className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>

        <span className="mx-1 h-7 w-px bg-[#E75480]/20" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().setTextAlign("left").run()
          }
          className={buttonClass(
            editor.isActive({ textAlign: "left" })
          )}
        >
          Left
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("center")
              .run()
          }
          className={buttonClass(
            editor.isActive({ textAlign: "center" })
          )}
        >
          Centre
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("right")
              .run()
          }
          className={buttonClass(
            editor.isActive({ textAlign: "right" })
          )}
        >
          Right
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setTextAlign("justify")
              .run()
          }
          className={buttonClass(
            editor.isActive({ textAlign: "justify" })
          )}
        >
          Justify
        </button>

        <span className="mx-1 h-7 w-px bg-[#E75480]/20" />

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={buttonClass(
            editor.isActive("bulletList")
          )}
        >
          Bullets
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
          className={buttonClass(
            editor.isActive("orderedList")
          )}
        >
          Numbers
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
          className={buttonClass(
            editor.isActive("blockquote")
          )}
        >
          Quote
        </button>

        <button
          type="button"
          onClick={addLink}
          className={buttonClass(editor.isActive("link"))}
        >
          Link
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() =>
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .unsetLink()
                .run()
            }
            className={buttonClass()}
          >
            Remove Link
          </button>
        )}

        <button
          type="button"
          disabled={isUploadingImage}
          onClick={() => imageInputRef.current?.click()}
          className={buttonClass(false, isUploadingImage)}
        >
          {isUploadingImage
            ? "Uploading..."
            : "Add Image"}
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              uploadArticleImage(file);
            }
          }}
        />

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHorizontalRule()
              .run()
          }
          className={buttonClass()}
        >
          Divider
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .unsetAllMarks()
              .clearNodes()
              .run()
          }
          className={buttonClass()}
        >
          Clear
        </button>

        <button
          type="button"
          disabled={!canUndo}
          onClick={() =>
            editor.chain().focus().undo().run()
          }
          className={buttonClass(false, !canUndo)}
        >
          Undo
        </button>

        <button
          type="button"
          disabled={!canRedo}
          onClick={() =>
            editor.chain().focus().redo().run()
          }
          className={buttonClass(false, !canRedo)}
        >
          Redo
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}