interface SingleRule {
    rule: {
        extensions: string | string[];
        startsWith: string;
        endsWith: string;
        destination: string;
    };
}

export default SingleRule;
