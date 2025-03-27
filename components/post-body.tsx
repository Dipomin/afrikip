import styles from "./post-body.module.css";

export default function PostBody({ content }) {
  return (
    <div className="lg:mx-10">
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
