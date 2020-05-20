export class DatasourceOperationParameter {

    name
    in
    description
    required
    schema

    static fromJSON(d: Object): DatasourceOperationParameter {
        let obj = Object.assign(new DatasourceOperationParameter(), d);
        return obj
    }

    // Range Convenience Methods

    isRange(): boolean {
        return this.isMinRange() || this.isMaxRange()
    }

    isMinRange(): boolean {
        return this.schemaOptionEquals('lower-limit')
    }

    isMaxRange(): boolean {
        return this.schemaOptionEquals('upper-limit')
    }

    // Pagination Convenience Methods

    isPagination(): boolean {
        return this.isPaginationPageNumber() || this.isPaginationPageLength()
    }

    isPaginationPageNumber(): boolean {
        return this.schemaOptionEquals('pagination-page-number')
    }

    isPaginationPageLength(): boolean {
        return this.schemaOptionEquals('pagination-page-length')
    }

    // Helper methods

    schemaOptionEquals(value: string): boolean {
        let isRange: boolean = false
        if ("option" in this.schema) {
            let schemaOption = this.schema['option']
            isRange = schemaOption === value
        }
        return isRange
    }

}
